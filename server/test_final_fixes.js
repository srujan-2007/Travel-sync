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
    console.log(`User: ${prompt}`);
    try {
        const res = await axios.post(API_CHAT, { prompt, history: [] }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Bot:\n${res.data.response}\n`);
        return res.data.response;
    } catch (err) {
        console.error(`Error: ${err.message}\n`);
        return null;
    }
}

async function runTests() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear pending actions just in case
    await PendingAction.deleteMany({});

    const user = await User.findOne({ username: 'adhoctester' }) || await User.findOne({});
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log("=== TEST 1: Direct GENERATE_PLAN hallucination check ===");
    await sendPrompt(token, "trip name: fly to dubai , can you plan my trip"); 

    console.log("=== TEST 2: Smart Intercept in PLAN_AD_HOC ===");
    await sendPrompt(token, "can you plan my trip"); // Starts PLAN_AD_HOC
    await sendPrompt(token, "fly to dubai"); // Should intercept and generate plan instantly

    process.exit(0);
}

runTests();
