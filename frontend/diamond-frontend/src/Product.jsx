// components/ProductCard.jsx
import React from "react"
import QuantityController from "../src/component/QuantityController"

export default function ProductCard({
  product,
  quantity,
  onQuantityChange,
  onIncrement,
  onDecrement,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            {product.name}
          </h3>
          <p className="text-2xl font-bold text-blue-600">${product.price}</p>
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
        <QuantityController
          value={quantity}
          max={product.stock}
          onChange={(val) => onQuantityChange(product.id, val)}
          onIncrement={() => onIncrement(product.id, 1)}
          onDecrement={() => onDecrement(product.id, -1)}
        />

        {quantity > 0 && (
          <div className="text-right">
            <p className="text-sm text-gray-500">Subtotal</p>
            <p className="font-semibold text-gray-800">
              ${(product.price * quantity).toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
