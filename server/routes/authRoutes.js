const express = require('express');
const router = express.Router();

// Import the controller functions we just created
const { signup, login } = require('../controllers/authController');

// Define the routes and map them to their specific controller functions
// For example, an HTTP POST request to /signup will trigger the signup function
router.post('/signup', signup);
router.post('/login', login);

module.exports = router;
