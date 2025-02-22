const User = require("../models/userModel")
const Cart = require("../models/cartModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

// Loard enviornment variable
require("dotenv").config();

// Controller function for user registration
exports.register = async (req, res) => {
    const { username, firstname, lastname, email, password } = req.body
    try {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({
                message: "User email already exists"
            });
        }

        // hash Password
        const hashPassword = await bcrypt.hash(password, 10)
        // register user
        const newUser = new User({
            username,
            firstname,
            lastname,
            email,
            password: hashPassword
        })

        await newUser.save();
        // create a cart for the user
        const cart = new Cart({
            user: newUser._id
        });

        // Save the cart to the database
        await cart.save();
        // Respond with success message
        res.status(200).json({
            message: "User registered successfully and cart created",
            user: newUser,
            cart
        });

    } catch (error) {
        res.status(500).send({
            message: "Error: User registered failed",
            error: error.message
        })
    }
}

// Controller function for user login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email not found" });
        }

        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        // Generate the JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            message: "Login successful",
            user: { _id: user._id, email: user.email, name: user.name }, // Avoid sending password
            token
        });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Login failed, please try again" });
    }
};