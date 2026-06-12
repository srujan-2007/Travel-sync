const Expense = require('../models/Expense');

const createExpense = async (req, res) => {
    try {
        const expense = new Expense({ userId: req.user.id, ...req.body });
        const saved = await expense.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getExpensesByTrip = async (req, res) => {
    try {
        const items = await Expense.find({ tripId: req.params.tripId, userId: req.user.id });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateExpense = async (req, res) => {
    try {
        const item = await Expense.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteExpense = async (req, res) => {
    try {
        await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ message: 'Expense removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createExpense, getExpensesByTrip, updateExpense, deleteExpense };
