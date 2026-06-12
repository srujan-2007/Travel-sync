const mongoose = require('mongoose');

// The Expense schema tracks financial spending during a trip.
const expenseSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        tripId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Trip',
            required: true,
        },
        category: {
            type: String,
            required: true, // e.g., 'Food', 'Transport', 'Hotel'
        },
        amount: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        description: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Expense', expenseSchema);
