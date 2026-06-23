const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const Memory = require('../models/Memory');
const Activity = require('../models/Activity');

// @desc    Get complete dashboard summary statistics
// @route   GET /api/analytics/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Trip Aggregations (Total Trips, Upcoming Trips, Total Budget)
        const tripStats = await Trip.aggregate([
            { $match: { userId } },
            { 
                $group: {
                    _id: null,
                    totalTrips: { $sum: 1 },
                    totalBudget: { $sum: "$budget" },
                    upcomingTrips: {
                        $sum: {
                            $cond: [{ $gt: ["$startDate", today] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        // 2. Expense Aggregations (Total Expenses)
        const expenseStats = await Expense.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    totalExpenses: { $sum: "$amount" }
                }
            }
        ]);

        // 3. Simple counts for Memories and Activities (or aggregations)
        const totalMemories = await Memory.countDocuments({ userId });
        const totalActivities = await Activity.countDocuments({ userId });

        const summary = {
            totalTrips: tripStats[0]?.totalTrips || 0,
            upcomingTrips: tripStats[0]?.upcomingTrips || 0,
            totalBudget: tripStats[0]?.totalBudget || 0,
            totalExpenses: expenseStats[0]?.totalExpenses || 0,
            remainingBudget: (tripStats[0]?.totalBudget || 0) - (expenseStats[0]?.totalExpenses || 0),
            totalMemories,
            totalActivities
        };

        res.json(summary);
    } catch (error) {
        next(error);
    }
};

// @desc    Get expenses grouped by category
// @route   GET /api/analytics/expenses-by-category
// @access  Private
const getExpensesByCategory = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        
        const expenses = await Expense.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: "$category",
                    totalAmount: { $sum: "$amount" }
                }
            },
            { $sort: { totalAmount: -1 } },
            {
                $project: {
                    name: "$_id",
                    value: "$totalAmount",
                    _id: 0
                }
            }
        ]);

        // If 'name' is null, it means category was empty, map it to 'Other'
        const formattedExpenses = expenses.map(e => ({
            name: e.name || 'Other',
            value: e.value
        }));

        res.json(formattedExpenses);
    } catch (error) {
        next(error);
    }
};

// @desc    Get top destinations
// @route   GET /api/analytics/top-destinations
// @access  Private
const getTopDestinations = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const destinations = await Trip.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: "$destination",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $project: {
                    destination: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);

        res.json(destinations);
    } catch (error) {
        next(error);
    }
};

// @desc    Get trips grouped by month
// @route   GET /api/analytics/trips-by-month
// @access  Private
const getTripsByMonth = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const tripsByMonth = await Trip.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: {
                        month: { $month: "$startDate" },
                        year: { $year: "$startDate" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        const formattedData = tripsByMonth.map(item => ({
            name: `${months[item._id.month - 1]} ${item._id.year}`,
            trips: item.count
        }));

        res.json(formattedData);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardSummary,
    getExpensesByCategory,
    getTopDestinations,
    getTripsByMonth
};
