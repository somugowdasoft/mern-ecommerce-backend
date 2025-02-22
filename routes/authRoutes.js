const express = require("express")
const { register, login } = require("../controllers/authController")

const router = express.Router();

// This route handles POST requests for user registration
router.post("/register", register)

// This route handles POST requests for user login
router.post("/login", login)

module.exports = router