const express = require("express")
const router = express.Router()
const products = require("../data/products")

// GET /products - Return all products
router.get("/", (req, res) => {
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

module.exports = router
