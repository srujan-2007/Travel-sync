const Itinerary = require('../models/Itinerary');

// Create itinerary item
const createItinerary = async (req, res, next) => {
    try {
        const itinerary = new Itinerary({ userId: req.user.id, ...req.body });
        const saved = await itinerary.save();
        res.status(201).json(saved);
    } catch (error) {
        next(error);
    }
};

// Get all itineraries for a specific trip
const getItinerariesByTrip = async (req, res, next) => {
    try {
        const items = await Itinerary.find({ tripId: req.params.tripId, userId: req.user.id });
        res.json(items);
    } catch (error) {
        next(error);
    }
};

// Update itinerary
const updateItinerary = async (req, res, next) => {
    try {
        const item = await Itinerary.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        if (!item) {
            res.status(404);
            return next(new Error('Itinerary not found or unauthorized'));
        }
        res.json(item);
    } catch (error) {
        next(error);
    }
};

// Delete itinerary
const deleteItinerary = async (req, res, next) => {
    try {
        const item = await Itinerary.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!item) {
            res.status(404);
            return next(new Error('Itinerary not found or unauthorized'));
        }
        res.json({ message: 'Itinerary removed' });
    } catch (error) {
        next(error);
    }
};

module.exports = { createItinerary, getItinerariesByTrip, updateItinerary, deleteItinerary };
