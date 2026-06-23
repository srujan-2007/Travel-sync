const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getDashboardSummary,
    getExpensesByCategory,
    getTopDestinations,
    getTripsByMonth
} = require('../controllers/analyticsController');

// All analytics routes require authentication
router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/expenses-by-category', getExpensesByCategory);
router.get('/top-destinations', getTopDestinations);
router.get('/trips-by-month', getTripsByMonth);

module.exports = router;
