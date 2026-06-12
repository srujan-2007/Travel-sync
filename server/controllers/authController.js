const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper function to generate a JWT token
// It embeds the user's ID inside the token and signs it with our secret key
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
    try {
        // 1. Get the data from the request body (which perfectly matches your User schema!)
        const { name, username, mobileNumber, password } = req.body;

        // 2. Check if a user with this username already exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 3. Hash the password before saving it to the database for security
        // The 'salt' adds random data to the hash making it harder to crack
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create the new user in the database
        const user = await User.create({
            name,
            username,
            mobileNumber,
            password: hashedPassword,
        });

        // 5. Send back a success response along with the token
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                username: user.username,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during signup' });
    }
};

// @desc    Login existing user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Find the user in the database by their username
        const user = await User.findOne({ username });

        // 2. If user exists, compare the entered password with the hashed password in the DB
        if (user && (await bcrypt.compare(password, user.password))) {
            // Passwords match! Send back the user info and a new token
            res.json({
                _id: user._id,
                name: user.name,
                username: user.username,
                token: generateToken(user._id),
            });
        } else {
            // Either username not found or password incorrect
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

module.exports = {
    signup,
    login,
};
