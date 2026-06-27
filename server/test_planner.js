const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const Trip = require('./models/Trip');
const PendingAction = require('./models/PendingAction');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

async function sendPrompt(token, prompt) {
    const res = await axios.post(`http://localhost:${PORT}/api/ai/chat`, { prompt, history: [] }, {
        headers: { Authorization: `Bearer ${token}`, 'x-simulate-outage': 'true' }
    });
    return res.data.response;
}

async function runManualTest() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for testing.");
    
    // Setup
    await User.deleteMany({});
    await Trip.deleteMany({});
    await PendingAction.deleteMany({});
    
    const user = await User.create({ name: 'Test', username: 'tester1', email: 'test@test.com', mobileNumber: '1234567890', password: 'password123' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log("\n--- STARTING TRIP CREATION (CRUD ONLY) ---");
    let res = await sendPrompt(token, "Plan a trip to Japan");
    console.log("Q1:", res);
    res = await sendPrompt(token, "Tokyo Escape");
    console.log("Q2:", res);
    res = await sendPrompt(token, "Tokyo");
    console.log("Q3:", res);
    res = await sendPrompt(token, "2026-10-01");
    console.log("Q4:", res);
    res = await sendPrompt(token, "2026-10-10");
    console.log("Q5:", res);
    res = await sendPrompt(token, "5000");
    console.log("Q6:", res);
    res = await sendPrompt(token, "2");
    console.log("Q7:", res);
    res = await sendPrompt(token, "yes");
    console.log("FINAL CRUD RESPONSE:", res);

    // Verify
    const savedTrip = await Trip.findOne({ userId: user._id });
    console.log("\n--- DATABASE VERIFICATION ---");
    console.log(savedTrip ? `✅ Trip '${savedTrip.tripName}' successfully saved to MongoDB!` : "❌ Failed to save trip.");

    // Trigger AI Planner
    console.log("\n--- TRIGGERING AI PLANNER ---");
    console.log("User Input: 'Generate itinerary for my trip'");
    const planRes = await sendPrompt(token, "Generate itinerary for my trip");
    
    console.log("\n--- AI PLANNER RESPONSE ---");
    console.log(planRes);

    process.exit(0);
}

runManualTest().catch(err => {
    console.error(err);
    process.exit(1);
});
