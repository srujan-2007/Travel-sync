const mongoose = require('mongoose');

// The PendingAction schema stores conversational state for CRUD operations.
// It securely links the action to a specific user to prevent state mixing.
const pendingActionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    action: {
        type: String,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'CONTEXT'],
        required: true,
    },
    step: {
        type: String,
        required: true, // e.g., 'COLLECTING', 'SELECTING', 'CONFIRMING'
    },
    data: {
        type: mongoose.Schema.Types.Mixed, // Stores dynamic data like extracted fields, tripId, arrays of trips, etc.
        default: {}
    }
}, {
    timestamps: true, // Automatically cleans up old states if we add a TTL index in the future
});

module.exports = mongoose.model('PendingAction', pendingActionSchema);
