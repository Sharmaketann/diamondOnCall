// Middleware to log incoming requests
const logger = (req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.originalUrl}`)
  next()
}

module.exports = logger
