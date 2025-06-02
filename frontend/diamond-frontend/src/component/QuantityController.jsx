// components/QuantityController.jsx
import React from "react"
import { Minus, Plus } from "lucide-react"

export default function QuantityController({
  value,
  max,
  onChange,
  onIncrement,
  onDecrement,
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onDecrement}
        disabled={value <= 0}
        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
      >
        <Minus className="w-4 h-4" />
      </button>

      <input
        type="number"
        min="0"
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-16 text-center border border-gray-300 rounded px-2 py-1"
      />

      <button
        onClick={onIncrement}
        disabled={value >= max}
        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )
}
