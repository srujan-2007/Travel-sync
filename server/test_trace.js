const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const Trip = require('./models/Trip');
const PendingAction = require('./models/PendingAction');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const API_CHAT = `http://localhost:${PORT}/api/ai/chat`;

async function sendPrompt(token, prompt) {
    console.log(`\nUser: ${prompt}`);
    try {
        const res = await axios.post(API_CHAT, { prompt, history: [], systemPrompt: 'You are an AI assistant.' }, {
            headers: { Authorization: `Bearer ${token}` } // NOT simulating outage this time to test real LLM intent
        });
        console.log(`Bot: ${res.data.response}`);
    } catch (err) {
        console.error(`Error:`, err.message);
    }
}

async function runTest() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Setup
    await User.deleteMany({});
    await Trip.deleteMany({});
    await PendingAction.deleteMany({});
    
    const user = await User.create({ name: 'Test', username: 'tester', email: 'test@test.com', mobileNumber: '1234567890', password: 'password' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log("--- STARTING TEST ---");
    await sendPrompt(token, "create a trip");
    await sendPrompt(token, "Fly to Dubai");
    await sendPrompt(token, "Dubai");
    await sendPrompt(token, "Hyderabad");
    await sendPrompt(token, "2026-08-01");
    await sendPrompt(token, "2026-08-05");
    await sendPrompt(token, "2000");
    await sendPrompt(token, "1");
    await sendPrompt(token, "yes");
    console.log("--- TRIGGERING AI PLANNER ---");
    await sendPrompt(token, "generate itinerary for my Fly to Dubai trip");
    
    console.log("--- TEST END ---");
    process.exit(0);
}

runTest();
