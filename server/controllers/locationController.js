const Location = require('../models/Location');

const createLocation = async (req, res, next) => {
    try {
        const location = new Location({ userId: req.user.id, ...req.body });
        const saved = await location.save();
        res.status(201).json(saved);
    } catch (error) {
        next(error);
    }
};

const getLocationsByTrip = async (req, res, next) => {
    try {
        const items = await Location.find({ tripId: req.params.tripId, userId: req.user.id });
        res.json(items);
    } catch (error) {
        next(error);
    }
};

const updateLocation = async (req, res, next) => {
    try {
        const item = await Location.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        if (!item) {
            res.status(404);
            return next(new Error('Location not found or unauthorized'));
        }
        res.json(item);
    } catch (error) {
        next(error);
    }
};

const deleteLocation = async (req, res, next) => {
    try {
        const item = await Location.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!item) {
            res.status(404);
            return next(new Error('Location not found or unauthorized'));
        }
        res.json({ message: 'Location removed' });
    } catch (error) {
        next(error);
    }
};

const searchLocations = async (req, res, next) => {
    try {
        const { tripId, q } = req.query;
        if (!tripId || !q) {
            return res.json([]);
        }
        const items = await Location.find({
            userId: req.user.id,
            tripId: tripId,
            placeName: { $regex: q, $options: 'i' }
        });
        res.json(items);
    } catch (error) {
        next(error);
    }
};

module.exports = { createLocation, getLocationsByTrip, updateLocation, deleteLocation, searchLocations };
