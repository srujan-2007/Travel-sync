const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createMemory, getMemoriesByTrip, updateMemory, deleteMemory, searchMemories, getMemoryTimeline } = require('../controllers/memoryController');

router.use(protect);

router.post('/', createMemory);
router.get('/trip/:tripId', getMemoriesByTrip);
router.get('/timeline/:tripId', getMemoryTimeline);
router.get('/search', searchMemories);
router.put('/:id', updateMemory);
router.delete('/:id', deleteMemory);

module.exports = router;
