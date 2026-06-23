const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { generateChatResponse } = require('../controllers/aiController');

/**
 * AI Routes
 * 
 * Why does this exist?
 * It maps URL endpoints to their corresponding controller functions.
 * Using Express Router keeps our main server.js file clean.
 * 
 * We use the `protect` middleware to ensure that ONLY logged-in users 
 * (who provide a valid JWT token) can access our AI endpoints, preventing abuse.
 */

// POST /api/ai/chat
// We map the /chat path to the generateChatResponse function.
// It runs through `protect` first. If the token is invalid, it stops there.
router.post('/chat', protect, generateChatResponse);

// We can easily add future endpoints here:
// router.post('/plan-trip', protect, generateTripPlan);
// router.post('/generate-budget', protect, generateBudget);

module.exports = router;
