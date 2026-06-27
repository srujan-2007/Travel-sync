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
        console.log(`Bot: ${res.data.response}\n`);
        return res.data.response;
    } catch (err) {
        console.error(`Error: ${err.message}\n`);
        return null;
    }
}

async function runTests() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Setup Clean State
    await User.deleteMany({});
    await Trip.deleteMany({});
    await PendingAction.deleteMany({});
    
    const user = await User.create({ name: 'AdHoc Tester', username: 'adhoctester', email: 'adhoc@test.com', mobileNumber: '1234567890', password: 'password' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log("TEST 1: Verify CANCEL keyword aborts active workflow");
    await sendPrompt(token, "create a trip"); // Starts CREATE_TRIP
    await sendPrompt(token, "cancel"); // Should abort
    const pending1 = await PendingAction.countDocuments({ userId: user._id });
    console.log(`Pending actions after cancel: ${pending1} (Expected: 0)\n`);

    console.log("TEST 2: Verify PLAN_AD_HOC flow generates plan without DB save");
    await sendPrompt(token, "can you plan my trip for fly to america"); // Should ask for trip name
    await sendPrompt(token, "fly to america"); // Name
    await sendPrompt(token, "America"); // Destination
    await sendPrompt(token, "London"); // Starting Point
    await sendPrompt(token, "2026-10-01"); // Start Date
    await sendPrompt(token, "2026-10-05"); // End Date
    await sendPrompt(token, "5000"); // Budget
    await sendPrompt(token, "2"); // Travelers
    
    // Should confirm generation instead of creation
    const summary = await sendPrompt(token, "yes"); 
    
    const trips = await Trip.countDocuments({ userId: user._id });
    console.log(`\nTrips in Database: ${trips} (Expected: 0)`);

    process.exit(0);
}

runTests();
