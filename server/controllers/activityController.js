const Activity = require('../models/Activity');

const createActivity = async (req, res, next) => {
    try {
        const activity = new Activity({ userId: req.user.id, ...req.body });
        const saved = await activity.save();
        res.status(201).json(saved);
    } catch (error) {
        next(error);
    }
};

const getActivitiesByTrip = async (req, res, next) => {
    try {
        const items = await Activity.find({ tripId: req.params.tripId, userId: req.user.id });
        res.json(items);
    } catch (error) {
        next(error);
    }
};

const updateActivity = async (req, res, next) => {
    try {
        const item = await Activity.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        if (!item) {
            res.status(404);
            return next(new Error('Activity not found or unauthorized'));
        }
        res.json(item);
    } catch (error) {
        next(error);
    }
};

const deleteActivity = async (req, res, next) => {
    try {
        const item = await Activity.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!item) {
            res.status(404);
            return next(new Error('Activity not found or unauthorized'));
        }
        res.json({ message: 'Activity removed' });
    } catch (error) {
        next(error);
    }
};

module.exports = { createActivity, getActivitiesByTrip, updateActivity, deleteActivity };
