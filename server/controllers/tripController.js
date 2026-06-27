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
        if (budget !== undefined && budget <= 0) {
            res.status(400);
            return next(new Error('Budget must be a positive number'));
        }
        if (req.body.numberOfTravelers !== undefined && req.body.numberOfTravelers < 1) {
            res.status(400);
            return next(new Error('Travelers must be at least 1'));
        }
        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
            res.status(400);
            return next(new Error('End date must be after start date'));
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

// Get all trips for the logged-in user (with optional filters)
const getTrips = async (req, res, next) => {
    try {
        const { q, status, budget, destination } = req.query;
        let query = { userId: req.user.id };

        // Handle Global Search (q)
        if (q) {
            query.$or = [
                { tripName: { $regex: q, $options: 'i' } },
                { destination: { $regex: q, $options: 'i' } }
            ];
        }

        // Handle Destination Filter
        if (destination) {
            // If search is also providing destination, this will just add a strict destination filter
            // which MongoDB handles by ANDing implicit object keys.
            query.destination = { $regex: destination, $options: 'i' };
        }

        // Handle Status Filter
        if (status) {
            const currentDate = new Date();
            if (status === 'Upcoming') {
                query.startDate = { $gt: currentDate };
            } else if (status === 'Ongoing') {
                query.startDate = { $lte: currentDate };
                query.endDate = { $gte: currentDate };
            } else if (status === 'Completed') {
                query.endDate = { $lt: currentDate };
            }
        }

        // Handle Budget Filter
        if (budget) {
            if (budget === 'Under $10,000') {
                query.budget = { $lt: 10000 };
            } else if (budget === '$10,000 - $50,000') {
                query.budget = { $gte: 10000, $lte: 50000 };
            } else if (budget === 'Above $50,000') {
                query.budget = { $gt: 50000 };
            }
        }

        const trips = await Trip.find(query);
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
        if (budget !== undefined && budget <= 0) {
            res.status(400);
            return next(new Error('Budget must be a positive number'));
        }
        if (req.body.numberOfTravelers !== undefined && req.body.numberOfTravelers < 1) {
            res.status(400);
            return next(new Error('Travelers must be at least 1'));
        }
        if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
            res.status(400);
            return next(new Error('End date must be after start date'));
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
            // The Trip model middleware will automatically cascade this deletion
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

const searchTrips = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.json([]);
        }
        const trips = await Trip.find({
            userId: req.user.id,
            $or: [
                { tripName: { $regex: q, $options: 'i' } },
                { destination: { $regex: q, $options: 'i' } }
            ]
        });
        res.json(trips);
    } catch (error) {
        next(error);
    }
};

module.exports = { createTrip, getTrips, getTripById, updateTrip, deleteTrip, searchTrips };
