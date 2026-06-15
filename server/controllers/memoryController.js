const Memory = require('../models/Memory');

const createMemory = async (req, res, next) => {
    try {
        const memory = new Memory({ userId: req.user.id, ...req.body });
        const saved = await memory.save();
        res.status(201).json(saved);
    } catch (error) {
        next(error);
    }
};

const getMemoriesByTrip = async (req, res, next) => {
    try {
        const items = await Memory.find({ tripId: req.params.tripId, userId: req.user.id });
        res.json(items);
    } catch (error) {
        next(error);
    }
};

const updateMemory = async (req, res, next) => {
    try {
        const item = await Memory.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        if (!item) {
            res.status(404);
            return next(new Error('Memory not found or unauthorized'));
        }
        res.json(item);
    } catch (error) {
        next(error);
    }
};

const deleteMemory = async (req, res, next) => {
    try {
        const item = await Memory.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!item) {
            res.status(404);
            return next(new Error('Memory not found or unauthorized'));
        }
        res.json({ message: 'Memory removed' });
    } catch (error) {
        next(error);
    }
};

module.exports = { createMemory, getMemoriesByTrip, updateMemory, deleteMemory };
