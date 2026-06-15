const mongoose = require('mongoose');

// The Activity schema stores individual activities logged by the user.
const activitySchema = new mongoose.Schema(
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
        activityName: {
            type: String,
            required: true,
        },
        place: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
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

module.exports = mongoose.model('Activity', activitySchema);
