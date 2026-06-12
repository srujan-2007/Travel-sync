const Activity = require('../models/Activity');

const createActivity = async (req, res) => {
    try {
        const activity = new Activity({ userId: req.user.id, ...req.body });
        const saved = await activity.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getActivitiesByTrip = async (req, res) => {
    try {
        const items = await Activity.find({ tripId: req.params.tripId, userId: req.user.id });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateActivity = async (req, res) => {
    try {
        const item = await Activity.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteActivity = async (req, res) => {
    try {
        await Activity.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ message: 'Activity removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createActivity, getActivitiesByTrip, updateActivity, deleteActivity };
