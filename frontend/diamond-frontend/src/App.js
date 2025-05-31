import React, { useState, useEffect } from "react"

const API_BASE_URL = "http://localhost:3001"

export default function InventorySystem() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState("")

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`)
      const result = await response.json()
      console.log(result)
      if (result.success) {
        setProducts(result.data)
      } else {
        setError("Failed to fetch products")
      }
    } catch (err) {
      setError(
        "Error connecting to server. Make sure backend is running on port 3001."
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            Inventory Sale System
          </h1>
        </div>
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
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
