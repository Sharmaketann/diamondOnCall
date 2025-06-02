import React, { useState, useEffect } from "react"
import {
  ShoppingCart,
  Package,
  DollarSign,
  Minus,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  List,
  Home,
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
  const [currentView, setCurrentView] = useState("inventory") // inventory | orders
  const [orders, setOrders] = useState([])

  useEffect(() => {
    fetchProducts()
    loadOrdersFromStorage()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/products`)
      const result = await response.json()
      console.log("result", result)
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

  const loadOrdersFromStorage = () => {
    try {
      const savedOrders = JSON.parse(
        localStorage.getItem("inventory_orders") || "[]"
      )
      setOrders(savedOrders)
    } catch (err) {
      console.error("Error loading orders from storage:", err)
    }
  }

  console.log("localStorage", localStorage.getItem("inventory_orders"))

  const saveOrderToStorage = (orderData) => {
    try {
      const savedOrders = JSON.parse(
        localStorage.getItem("inventory_orders") || "[]"
      )
      const newOrder = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        orderType: orderData.orderType || "sale",
      }
      const updatedOrders = [newOrder, ...savedOrders]
      localStorage.setItem("inventory_orders", JSON.stringify(updatedOrders))
      setOrders(updatedOrders)
    } catch (err) {
      console.error("Error saving order to storage:", err)
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
    let total = 0
    Object.entries(cart).forEach(([productId, quantity]) => {
      const product = products.find((p) => p.id === productId)
      if (product) {
        total += product.markup * quantity
      }
    })
    const final = total * (1 - discount / 100)
    return final
  }

  const calculateFinalPrice = (basePrice) => {
    const markup = basePrice
    // const priceWithMarkup = basePrice + markup
    // const discountAmount = priceWithMarkup * (discount / 100)
    return markup
  }

  const handlePurchase = async () => {
    if (Object.keys(cart).length === 0) {
      setError("Cart is empty")
      return
    }

    setPurchasing(true)
    setError("")

    try {
      const purchases = []
      for (const [productId, quantity] of Object.entries(cart)) {
        const response = await fetch(`${API_BASE_URL}/sales`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity, discount }),
        })
        const result = await response.json()
        if (!result.success) throw new Error(result.message)
        purchases.push(result.data)
      }

      setProducts((prev) =>
        prev.map((product) => {
          const purchase = purchases.find((p) => p.productId === product.id)
          return purchase
            ? { ...product, stock: purchase.remainingStock }
            : product
        })
      )

      const totalAmount = purchases.reduce((sum, p) => sum + p.finalPrice, 0)

      const orderData = {
        items: purchases,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        orderType: "sale",
      }

      setLastPurchase({ ...orderData, timestamp: new Date().toLocaleString() })
      saveOrderToStorage(orderData)
      setCart({})
    } catch (err) {
      setError(err.message || "Purchase failed")
    } finally {
      setPurchasing(false)
    }
  }

  const renderOrdersView = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <List className="w-6 h-6 text-blue-600" />
        Purchase Orders
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-600 text-center">No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-600 text-sm">
                  {new Date(order.timestamp).toLocaleString()}
                </p>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                  {order.orderType}
                </span>
              </div>
              <ul className="text-sm text-gray-700 mb-2 space-y-1">
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.productName} × {item.quantity} = ${item.finalPrice}
                  </li>
                ))}
              </ul>
              <div className="text-right font-bold text-green-700">
                Total: ${order.totalAmount}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderHeaderTabs = () => (
    <div className="flex justify-center gap-4 mb-6">
      <button
        className={`px-4 py-2 rounded font-medium ${
          currentView === "inventory"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
        onClick={() => setCurrentView("inventory")}
      >
        <Home className="w-4 h-4 inline mr-1" />
        Inventory
      </button>
      <button
        className={`px-4 py-2 rounded font-medium ${
          currentView === "orders"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
        onClick={() => {
          loadOrdersFromStorage()
          setCurrentView("orders")
        }}
      >
        <Clock className="w-4 h-4 inline mr-1" />
        Orders
      </button>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }
  const calculateSubtotal = () => {
    let subtotal = 0
    Object.entries(cart).forEach(([productId, quantity]) => {
      const product = products.find((p) => p.id === productId)
      if (product) {
        subtotal += product.markup * quantity
      }
    })
    return subtotal
  }

  const calculateDiscountValue = () => {
    const subtotal = calculateSubtotal()
    return (subtotal * discount) / 100
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-2 mb-2">
            <Package className="w-10 h-10 text-blue-600" />
            Inventory System DOC
          </h1>
          <p className="text-gray-500">Manage stock, sales, and orders</p>
        </div>

        {renderHeaderTabs()}

        {error && (
          <div className="mb-6 bg-red-100 text-red-800 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {currentView === "orders" ? (
          renderOrdersView()
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              {products.map((product) => {
                const qty = cart[product.id] || 0
                return (
                  <div
                    key={product.id}
                    className="bg-white border rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-semibold text-gray-800">
                        {product.name}
                      </h2>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          product.stock > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.stock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-blue-600 font-bold">
                        ${product.markup}
                      </span>
                      <span className="text-xs text-gray-500">
                        Stock: {product.stock}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={qty}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value, 10)

                            if (newQty > product.stock) {
                              alert(`Only ${product.stock} items in stock!`)
                              return
                            }

                            if (newQty < 0) return

                            setQuantity(product.id, newQty)
                          }}
                          className="w-12 text-center border rounded"
                          min="0"
                          max={product.stock}
                        />
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-sm text-gray-600">
                        Final: ${calculateFinalPrice(product.price)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Cart Summary */}
            <div className="bg-white p-4 rounded-lg shadow-md max-w-xl mx-auto">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                Cart Summary
              </h3>
              {Object.keys(cart).length === 0 ? (
                <p className="text-gray-600">Your cart is empty.</p>
              ) : (
                <>
                  <ul className="mb-4 text-gray-700 space-y-2">
                    {Object.entries(cart).map(([productId, quantity]) => {
                      const product = products.find((p) => p.id === productId)
                      console.log(product)
                      if (!product) return null
                      return (
                        <li key={productId} className="flex justify-between">
                          <span>
                            {product.name} × {quantity}
                          </span>
                          <span>${(product.markup * quantity).toFixed(2)}</span>
                        </li>
                      )
                    })}
                  </ul>
                  <div className="flex justify-between mb-1 text-red-600">
                    <span>Discount ({discount}%):</span>
                    <span>– ${calculateDiscountValue().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 border-t pt-2">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      Discount:
                      <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="w-16 border rounded text-center"
                      />
                      %
                    </label>
                    <button
                      onClick={handlePurchase}
                      disabled={purchasing}
                      className={`px-4 py-2 text-white rounded ${
                        purchasing
                          ? "bg-gray-400"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {purchasing ? "Processing..." : "Confirm Purchase"}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Last Purchase Info */}
            {lastPurchase && (
              <div className="mt-8 bg-green-50 p-4 rounded-lg shadow-sm max-w-xl mx-auto border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Last Purchase Summary
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Time: <strong>{lastPurchase.timestamp}</strong>
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {lastPurchase.items.map((item, idx) => (
                    <li key={idx}>
                      {item.productName} × {item.quantity} = ${item.finalPrice}
                    </li>
                  ))}
                </ul>
                <div className="text-right font-bold mt-2 text-green-800">
                  Total: ${lastPurchase.totalAmount}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
