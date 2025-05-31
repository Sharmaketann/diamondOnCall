const express = require("express")
const cors = require("cors")
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// In-memory product data
let products = [
  {
    id: "1",
    name: "Ring",
    price: 50,
    stock: 10,
  },
  {
    id: "2",
    name: "Shoes",
    price: 30,
    stock: 20,
  },
  {
    id: "3",
    name: "Wrist Watch",
    price: 120,
    stock: 15,
  },
  {
    id: "4",
    name: "Leather Wallet",
    price: 45,
    stock: 25,
  },
  {
    id: "5",
    name: "Backpack",
    price: 80,
    stock: 12,
  },
  {
    id: "6",
    name: "Sunglasses",
    price: 60,
    stock: 18,
  },
  {
    id: "7",
    name: "Headphones",
    price: 150,
    stock: 8,
  },
  {
    id: "8",
    name: "Bluetooth Speaker",
    price: 95,
    stock: 14,
  },
  {
    id: "9",
    name: "T-shirt",
    price: 25,
    stock: 30,
  },
  {
    id: "10",
    name: "Jeans",
    price: 40,
    stock: 20,
  },
]

// Constants
const MARKUP_PERCENTAGE = 20 // 20% markup on purchase price
const DEFAULT_DISCOUNT_PERCENTAGE = 10 // Default 10% discount

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.originalUrl}`)
  next()
})

// GET /products - Return all products
app.get("/products", (req, res) => {
  try {
    res.json({
      success: true,
      data: products,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: err.message,
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Products API: http://localhost:${PORT}/products`)
})

module.exports = app
