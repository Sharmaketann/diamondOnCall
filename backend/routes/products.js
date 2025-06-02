const express = require("express")
const router = express.Router()
const products = require("../data/products")
const { MARKUP_PERCENTAGE } = require("../config/constant")

// GET /products - Return all products
router.get("/", (req, res) => {
  const calculateFinalPrice = (basePrice) => {
    const markup = basePrice * MARKUP_PERCENTAGE
    const priceWithMarkup = basePrice + markup
    // const discountAmount = priceWithMarkup * (discount / 100)
    return priceWithMarkup
  }
  products.push({
    markup: calculateFinalPrice(products.price),
  })

  const newProducts = { ...products }
  console.log("newProduct", newProducts)
  try {
    const productsWithMarkup = products.map((product) => ({
      ...product,
      markup: calculateFinalPrice(product.price),
    }))

    res.json({
      success: true,
      data: productsWithMarkup,
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
