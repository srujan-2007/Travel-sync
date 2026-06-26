const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Trip = require('./models/Trip');
const PendingAction = require('./models/PendingAction');
const User = require('./models/User');

const API_URL = 'http://localhost:5000/api/ai/chat';

async function generateToken(username, email) {
    let user = await User.findOne({ username });
    if (!user) {
        user = await User.create({ name: username, username, email, password: 'password123', mobileNumber: Math.floor(Math.random() * 10000000000).toString() });
    }
    return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

async function sendPrompt(token, prompt) {
    console.log(`\n> User: ${prompt}`);
    try {
        const res = await axios.post(API_URL, { prompt, history: [], systemPrompt: "You are a helpful travel assistant." }, { headers: { Authorization: `Bearer ${token}` } });
        console.log(`Bot: ${res.data.response}`);
    } catch (e) {
        console.log(`Bot ERROR: ${e.response?.data?.message || e.message}`);
    }
}

async function runLiveTests() {
    await mongoose.connect(process.env.MONGO_URI);
    const token = await generateToken('LiveTester', 'live@tester.com');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    await Trip.deleteMany({ userId });
    await PendingAction.deleteMany({ userId });

    const prompts = [
        "Create trip",
        "explore hyderabad", // destination
        "Create trip",       // intercept
        "family trip list",  // tripName
        "Create trip",       // intercept
        "show low budget travel", // startingPoint
        "2026-06-01",        // startDate
        "2026-06-01",        // endDate -> triggers "must be after start date" error
        "2026-06-10",        // endDate -> valid
        "0",                 // budget -> triggers "positive number" error
        "5000",              // budget -> valid
        "0",                 // travelers -> triggers "at least 1" error
    ];

    for (const p of prompts) {
        await sendPrompt(token, p);
    }

    process.exit(0);
}

runLiveTests();
