const mongoose = require('mongoose');

// The Itinerary schema stores the day-by-day plan for a specific trip.
const itinerarySchema = new mongoose.Schema(
    {
        tripId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Trip',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        dayNumber: {
            type: Number,
            required: true,
        },
        place: {
            type: String,
            required: true,
        },
        activity: {
            type: String,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Itinerary', itinerarySchema);
