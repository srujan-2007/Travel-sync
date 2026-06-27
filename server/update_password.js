const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/User');

async function updatePassword() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        
        const hash = await bcrypt.hash('password123', 10);
        
        const result = await User.updateOne(
            { username: 'ecanjali22@gmail.com' },
            { $set: { password: hash } }
        );
        
        console.log("Password update result:", result);
        console.log("Local password set to: password123");
        
        process.exit(0);
    } catch (err) {
        console.error("Failed to update password:", err);
        process.exit(1);
    }
}

updatePassword();
