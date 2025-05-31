const express = require("express")
const cors = require("cors")
const app = express()
const productsRouter = require("./routes/products")
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
