const mongoose = require('mongoose');

// The Trip schema represents a single travel plan.
// It links back to the user who created it using the 'userId'.
const tripSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // This tells Mongoose that this ID references the 'User' collection
            required: true,
            index: true,
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

// Helper function for cascading deletes
async function cascadeDelete(tripId) {
    const models = ['Expense', 'Memory', 'Activity', 'Itinerary', 'Location'];
    for (const modelName of models) {
        try {
            const model = mongoose.model(modelName);
            await model.deleteMany({ tripId });
            console.log(`[Trip Middleware] Cascaded deletion: Removed ${modelName}s linked to Trip ${tripId}`);
        } catch (err) {
            // If a model is not registered yet, it might throw, but we can safely ignore or log it.
            console.error(`[Trip Middleware] Error cascading delete for ${modelName}:`, err);
        }
    }
}

// Middleware for Trip.findByIdAndDelete() or Trip.findOneAndDelete()
tripSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await cascadeDelete(doc._id);
    }
});

// Middleware for trip.deleteOne()
tripSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    await cascadeDelete(this._id);
    next();
});

module.exports = mongoose.model('Trip', tripSchema);
