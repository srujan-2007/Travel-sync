const Expense = require('../models/Expense');

const createExpense = async (req, res, next) => {
    try {
        if (req.body.amount !== undefined && req.body.amount < 0) {
            res.status(400);
            return next(new Error('Expense amount cannot be negative'));
        }
        const expense = new Expense({ userId: req.user.id, ...req.body });
        const saved = await expense.save();
        res.status(201).json(saved);
    } catch (error) {
        next(error);
    }
};

const getExpensesByTrip = async (req, res, next) => {
    try {
        const items = await Expense.find({ tripId: req.params.tripId, userId: req.user.id });
        res.json(items);
    } catch (error) {
        next(error);
    }
};

const updateExpense = async (req, res, next) => {
    try {
        if (req.body.amount !== undefined && req.body.amount < 0) {
            res.status(400);
            return next(new Error('Expense amount cannot be negative'));
        }
        const item = await Expense.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        if (!item) {
            res.status(404);
            return next(new Error('Expense not found or unauthorized'));
        }
        res.json(item);
    } catch (error) {
        next(error);
    }
};

const deleteExpense = async (req, res, next) => {
    try {
        const item = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!item) {
            res.status(404);
            return next(new Error('Expense not found or unauthorized'));
        }
        res.json({ message: 'Expense removed' });
    } catch (error) {
        next(error);
    }
};

module.exports = { createExpense, getExpensesByTrip, updateExpense, deleteExpense };
