const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const Memory = require('../models/Memory');
const Activity = require('../models/Activity');
const Itinerary = require('../models/Itinerary');
const Location = require('../models/Location');

// Create a new trip
const createTrip = async (req, res, next) => {
    try {
        const { budget, startDate, endDate } = req.body;

        // Manual validation
        if (budget !== undefined && budget < 0) {
            res.status(400);
            return next(new Error('Budget cannot be negative'));
        }
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            res.status(400);
            return next(new Error('Start date cannot be after end date'));
        }

        // req.user.id comes from the protect middleware
        const trip = new Trip({
            userId: req.user.id,
            ...req.body
        });
        const savedTrip = await trip.save();
        res.status(201).json(savedTrip);
    } catch (error) {
        next(error);
    }
};

// Get all trips for the logged-in user
const getTrips = async (req, res, next) => {
    try {
        const trips = await Trip.find({ userId: req.user.id });
        res.json(trips);
    } catch (error) {
        next(error);
    }
};

// Get a single trip by its ID
const getTripById = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (trip && trip.userId.toString() === req.user.id) {
            res.json(trip);
        } else {
            res.status(404);
            return next(new Error('Trip not found or unauthorized'));
        }
    } catch (error) {
        next(error);
    }
};

// Update a trip
const updateTrip = async (req, res, next) => {
    try {
        const { budget, startDate, endDate } = req.body;

        // Manual validation
        if (budget !== undefined && budget < 0) {
            res.status(400);
            return next(new Error('Budget cannot be negative'));
        }
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            res.status(400);
            return next(new Error('Start date cannot be after end date'));
        }

        const trip = await Trip.findById(req.params.id);
        if (trip && trip.userId.toString() === req.user.id) {
            const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(updatedTrip);
        } else {
            res.status(404);
            return next(new Error('Trip not found or unauthorized'));
        }
    } catch (error) {
        next(error);
    }
};

// Delete a trip
const deleteTrip = async (req, res, next) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (trip && trip.userId.toString() === req.user.id) {
            // Cascade Delete: Remove all related documents first
            await Expense.deleteMany({ tripId: req.params.id });
            await Memory.deleteMany({ tripId: req.params.id });
            await Activity.deleteMany({ tripId: req.params.id });
            await Itinerary.deleteMany({ tripId: req.params.id });
            await Location.deleteMany({ tripId: req.params.id });

            // Now delete the trip itself
            await trip.deleteOne();
            res.json({ message: 'Trip and all related data removed' });
        } else {
            res.status(404);
            return next(new Error('Trip not found or unauthorized'));
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { createTrip, getTrips, getTripById, updateTrip, deleteTrip };
