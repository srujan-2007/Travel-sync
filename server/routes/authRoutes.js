const express = require('express');
const router = express.Router();

// Import the controller functions we just created
const { signup, login, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Define the routes and map them to their specific controller functions
// For example, an HTTP POST request to /signup will trigger the signup function
router.post('/signup', signup);
router.post('/login', login);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
