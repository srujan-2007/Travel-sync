const mongoose = require('mongoose');

// The User schema defines the structure for our registered users.
// We use 'mongoose.Schema' to tell MongoDB exactly what fields to expect.
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true, // No two users can have the same username
        },
        mobileNumber: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' dates
    }
);

// We export the model so it can be used in our controllers to save/find users.
module.exports = mongoose.model('User', userSchema);
