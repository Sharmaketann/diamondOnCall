import React, { useState, useEffect } from "react"
import {
  ShoppingCart,
  Package,
  DollarSign,
  Minus,
  Plus,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

const API_BASE_URL = "http://localhost:3001"

export default function InventorySystem() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cart, setCart] = useState({})
  const [discount, setDiscount] = useState(10)
  const [purchasing, setPurchasing] = useState(false)
  const [lastPurchase, setLastPurchase] = useState(null)

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/products`)
      const result = await response.json()

      if (result.success) {
        setProducts(result.data)
      } else {
        setError("Failed to fetch products")
      }
    } catch (err) {
      setError(
        "Error connecting to server. Make sure backend is running on port 3001."
      )
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = (productId, change) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const currentQty = cart[productId] || 0
    const newQty = Math.max(0, Math.min(product.stock, currentQty + change))

    if (newQty === 0) {
      const newCart = { ...cart }
      delete newCart[productId]
      setCart(newCart)
    } else {
      setCart({ ...cart, [productId]: newQty })
    }
  }

  const setQuantity = (productId, quantity) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const qty = Math.max(0, Math.min(product.stock, parseInt(quantity) || 0))

    if (qty === 0) {
      const newCart = { ...cart }
      delete newCart[productId]
      setCart(newCart)
    } else {
      setCart({ ...cart, [productId]: qty })
    }
  }

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find((p) => p.id === productId)
      return total + (product ? product.price * quantity : 0)
    }, 0)
  }

  const calculateFinalPrice = (basePrice) => {
    const markup = basePrice * 0.2 // 20% markup
    const priceWithMarkup = basePrice + markup
    const discountAmount = priceWithMarkup * (discount / 100)
    return priceWithMarkup - discountAmount
  }

  const handlePurchase = async () => {
    if (Object.keys(cart).length === 0) {
      setError("Cart is empty")
      return
    }

    setPurchasing(true)
    setError("")

    try {
      // Process each item in cart
      const purchases = []
      for (const [productId, quantity] of Object.entries(cart)) {
        const response = await fetch(`${API_BASE_URL}/purchase`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            quantity,
            discount,
          }),
        })

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.message)
        }

        purchases.push(result.data)
      }

      // Update local product stock
      setProducts((prevProducts) =>
        prevProducts.map((product) => {
          const purchase = purchases.find((p) => p.productId === product.id)
          return purchase
            ? { ...product, stock: purchase.remainingStock }
            : product
        })
      )

      // Calculate total
      const totalAmount = purchases.reduce((sum, p) => sum + p.finalPrice, 0)

      setLastPurchase({
        items: purchases,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        timestamp: new Date().toLocaleString(),
      })

      // Clear cart
      setCart({})
    } catch (err) {
      setError(err.message || "Purchase failed")
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Package className="w-10 h-10 text-blue-600" />
            Inventory Sale System
          </h1>
          <p className="text-gray-600">
            Select products, set quantities, and complete your purchase
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {lastPurchase && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-green-800">
                Purchase Completed!
              </h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  Items Purchased:
                </h4>
                {lastPurchase.items.map((item, index) => (
                  <div key={index} className="text-sm text-gray-600 mb-1">
                    {item.productName} × {item.quantity} = ${item.finalPrice}
                  </div>
                ))}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  Total: ${lastPurchase.totalAmount}
                </p>
                <p className="text-sm text-gray-500">
                  {lastPurchase.timestamp}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Products List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Available Products
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {product.name}
                      </h3>
                      <p className="text-2xl font-bold text-blue-600">
                        ${product.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Stock</p>
                      <p
                        className={`text-lg font-semibold ${
                          product.stock > 5
                            ? "text-green-600"
                            : product.stock > 0
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {product.stock}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        disabled={!cart[product.id] || cart[product.id] <= 0}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={product.stock}
                        value={cart[product.id] || 0}
                        onChange={(e) =>
                          setQuantity(product.id, e.target.value)
                        }
                        className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                      />
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        disabled={
                          product.stock === 0 ||
                          (cart[product.id] || 0) >= product.stock
                        }
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {cart[product.id] && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Subtotal</p>
                        <p className="font-semibold text-gray-800">
                          ${(product.price * cart[product.id]).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart and Checkout */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 h-fit">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Cart Summary
            </h2>

            {Object.keys(cart).length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Your cart is empty
              </p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {Object.entries(cart).map(([productId, quantity]) => {
                    const product = products.find((p) => p.id === productId)
                    if (!product) return null

                    return (
                      <div
                        key={productId}
                        className="flex justify-between items-center py-2 border-b border-gray-100"
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">
                            ${product.price} × {quantity}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ${(product.price * quantity).toFixed(2)}
                        </p>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Base Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Markup (20%):</span>
                    <span>+${(calculateTotal() * 0.2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm">Discount (%):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discount}
                      onChange={(e) =>
                        setDiscount(
                          Math.max(
                            0,
                            Math.min(100, parseInt(e.target.value) || 0)
                          )
                        )
                      }
                      className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discount Amount:</span>
                    <span>
                      -${(calculateTotal() * 1.2 * (discount / 100)).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Final Total:</span>
                      <span className="text-green-600">
                        ${calculateFinalPrice(calculateTotal()).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {purchasing ? (
                    <>
                      <Package className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-5 h-5" />
                      Complete Purchase
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
