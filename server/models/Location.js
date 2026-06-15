const mongoose = require('mongoose');

// The Location schema stores specific places the user visited.
const locationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        tripId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Trip',
            required: true,
            index: true,
        },
        placeName: {
            type: String,
            required: true,
        },
        visitDate: {
            type: Date,
            required: true,
        },
        visitTime: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Location', locationSchema);
