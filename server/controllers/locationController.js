const Location = require('../models/Location');

const createLocation = async (req, res) => {
    try {
        const location = new Location({ userId: req.user.id, ...req.body });
        const saved = await location.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getLocationsByTrip = async (req, res) => {
    try {
        const items = await Location.find({ tripId: req.params.tripId, userId: req.user.id });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateLocation = async (req, res) => {
    try {
        const item = await Location.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteLocation = async (req, res) => {
    try {
        await Location.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ message: 'Location removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createLocation, getLocationsByTrip, updateLocation, deleteLocation };
