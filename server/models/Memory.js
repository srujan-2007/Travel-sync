const mongoose = require('mongoose');

// The Memory schema stores photos and travel notes for a trip.
const memorySchema = new mongoose.Schema(
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
        mediaType: {
            type: String,
            required: true, // e.g., 'Photo', 'Video'
        },
        mediaUrl: {
            type: String,
            required: true, // The URL where the file is stored (e.g., Cloudinary or local path)
        },
        caption: {
            type: String,
        },
        travelNote: {
            type: String,
        },
        date: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Memory', memorySchema);
