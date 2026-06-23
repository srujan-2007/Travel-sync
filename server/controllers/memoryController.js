const mongoose = require('mongoose');
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

const searchMemories = async (req, res, next) => {
    try {
        const { tripId, q } = req.query;
        if (!tripId || !q) {
            return res.json([]);
        }
        const items = await Memory.find({
            userId: req.user.id,
            tripId: tripId,
            $or: [
                { caption: { $regex: q, $options: 'i' } },
                { travelNote: { $regex: q, $options: 'i' } }
            ]
        });
        res.json(items);
    } catch (error) {
        next(error);
    }
};

const getMemoryTimeline = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const tripId = new mongoose.Types.ObjectId(req.params.tripId);
        
        const timeline = await Memory.aggregate([
            { $match: { tripId, userId } },
            { $sort: { date: 1 } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    memories: { $push: "$$ROOT" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);
        
        res.json(timeline);
    } catch (error) {
        next(error);
    }
};

module.exports = { createMemory, getMemoriesByTrip, updateMemory, deleteMemory, searchMemories, getMemoryTimeline };
