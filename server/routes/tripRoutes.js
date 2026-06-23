const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createTrip, getTrips, getTripById, updateTrip, deleteTrip, searchTrips } = require('../controllers/tripController');

// All trip routes are protected, meaning you must be logged in to access them
router.use(protect);

router.post('/', createTrip);
router.get('/', getTrips);
router.get('/search', searchTrips);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

module.exports = router;
