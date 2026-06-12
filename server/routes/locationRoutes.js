const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createLocation, getLocationsByTrip, updateLocation, deleteLocation } = require('../controllers/locationController');

router.use(protect);

router.post('/', createLocation);
router.get('/trip/:tripId', getLocationsByTrip);
router.put('/:id', updateLocation);
router.delete('/:id', deleteLocation);

module.exports = router;
