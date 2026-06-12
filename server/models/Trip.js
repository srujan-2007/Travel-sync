const mongoose = require('mongoose');

// The Trip schema represents a single travel plan.
// It links back to the user who created it using the 'userId'.
const tripSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // This tells Mongoose that this ID references the 'User' collection
            required: true,
        },
        tripName: {
            type: String,
            required: true,
        },
        startingPoint: {
            type: String,
            required: true,
        },
        destination: {
            type: String,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        budget: {
            type: Number,
            required: true,
        },
        numberOfTravelers: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Trip', tripSchema);
