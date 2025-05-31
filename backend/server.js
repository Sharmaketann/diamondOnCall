const express = require("express")
const cors = require("cors")
const app = express()
const productsRouter = require("./routes/products")
const purchaseRouter = require("./routes/purchase")
const logger = require("./middleware/logger")
const errorHandler = require("./middleware/errorHandler")

// Middleware
app.use(cors()) // Enable CORS for cross-origin requests
app.use(express.json()) // Parse JSON request bodies
app.use(logger) // Log incoming requests

// Routes
app.use("/products", productsRouter) // // Mount products routes
app.use("/purchase", purchaseRouter) // Mount purchase routes

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.originalUrl}`)
  next()
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
