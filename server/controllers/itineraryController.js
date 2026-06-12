const Itinerary = require('../models/Itinerary');

// Create itinerary item
const createItinerary = async (req, res) => {
    try {
        const itinerary = new Itinerary({ userId: req.user.id, ...req.body });
        const saved = await itinerary.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all itineraries for a specific trip
const getItinerariesByTrip = async (req, res) => {
    try {
        const items = await Itinerary.find({ tripId: req.params.tripId, userId: req.user.id });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update itinerary
const updateItinerary = async (req, res) => {
    try {
        const item = await Itinerary.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete itinerary
const deleteItinerary = async (req, res) => {
    try {
        await Itinerary.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ message: 'Itinerary removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createItinerary, getItinerariesByTrip, updateItinerary, deleteItinerary };
