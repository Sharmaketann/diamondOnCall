const express = require("express")
const cors = require("cors")
const app = express()
const productsRouter = require("./routes/products")
const products = require("../backend/data/products")
// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/products", productsRouter)

// In-memory product data

// Constants
const MARKUP_PERCENTAGE = 20 // 20% markup on purchase price
const DEFAULT_DISCOUNT_PERCENTAGE = 10 // Default 10% discount

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.originalUrl}`)
  next()
})

// POST /purchase - Process purchase
app.post("/purchase", (req, res) => {
  try {
    const {
      productId,
      quantity,
      discount = DEFAULT_DISCOUNT_PERCENTAGE,
    } = req.body

    // Validation
    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
      })
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      })
    }

    if (discount < 0 || discount > 100) {
      return res.status(400).json({
        success: false,
        message: "Discount must be between 0 and 100",
      })
    }

    // Find product
    const product = products.find((p) => p.id === productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Prepare response
    const purchaseDetails = {
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity: quantity,
    }

    res.json({
      success: true,
      message: "Purchase completed successfully",
      data: purchaseDetails,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Purchase failed",
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
