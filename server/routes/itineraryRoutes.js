const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createItinerary, getItinerariesByTrip, updateItinerary, deleteItinerary } = require('../controllers/itineraryController');

router.use(protect);

router.post('/', createItinerary);
router.get('/trip/:tripId', getItinerariesByTrip);
router.put('/:id', updateItinerary);
router.delete('/:id', deleteItinerary);

module.exports = router;
