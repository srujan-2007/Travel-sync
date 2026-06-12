const Trip = require('../models/Trip');

// Create a new trip
const createTrip = async (req, res) => {
    try {
        // req.user.id comes from the protect middleware
        const trip = new Trip({
            userId: req.user.id,
            ...req.body
        });
        const savedTrip = await trip.save();
        res.status(201).json(savedTrip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all trips for the logged-in user
const getTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ userId: req.user.id });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single trip by its ID
const getTripById = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (trip && trip.userId.toString() === req.user.id) {
            res.json(trip);
        } else {
            res.status(404).json({ message: 'Trip not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a trip
const updateTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (trip && trip.userId.toString() === req.user.id) {
            const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(updatedTrip);
        } else {
            res.status(404).json({ message: 'Trip not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a trip
const deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (trip && trip.userId.toString() === req.user.id) {
            await trip.deleteOne();
            res.json({ message: 'Trip removed' });
        } else {
            res.status(404).json({ message: 'Trip not found or unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createTrip, getTrips, getTripById, updateTrip, deleteTrip };
