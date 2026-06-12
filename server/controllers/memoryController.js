const Memory = require('../models/Memory');

const createMemory = async (req, res) => {
    try {
        const memory = new Memory({ userId: req.user.id, ...req.body });
        const saved = await memory.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMemoriesByTrip = async (req, res) => {
    try {
        const items = await Memory.find({ tripId: req.params.tripId, userId: req.user.id });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMemory = async (req, res) => {
    try {
        const item = await Memory.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteMemory = async (req, res) => {
    try {
        await Memory.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ message: 'Memory removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createMemory, getMemoriesByTrip, updateMemory, deleteMemory };
