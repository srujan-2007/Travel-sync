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
const signup = async (req, res, next) => {
    try {
        // 1. Get the data from the request body (which perfectly matches your User schema!)
        const { name, username, mobileNumber, password } = req.body;

        // Manual Input Validation
        if (!name || !username || !mobileNumber || !password) {
            res.status(400);
            return next(new Error('Please provide all required fields'));
        }
        if (password.length < 6) {
            res.status(400);
            return next(new Error('Password must be at least 6 characters long'));
        }
        if (mobileNumber.length < 10) {
            res.status(400);
            return next(new Error('Please provide a valid mobile number'));
        }

        // 2. Check if a user with this username already exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            res.status(400);
            return next(new Error('User already exists'));
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
            res.status(400);
            return next(new Error('Invalid user data'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Login existing user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400);
            return next(new Error('Please provide username and password'));
        }

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
            res.status(401);
            return next(new Error('Invalid username or password'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404);
            return next(new Error('User not found'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.mobileNumber = req.body.mobileNumber || user.mobileNumber;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                username: updatedUser.username,
                mobileNumber: updatedUser.mobileNumber,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404);
            return next(new Error('User not found'));
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    signup,
    login,
    getProfile,
    updateProfile,
};
