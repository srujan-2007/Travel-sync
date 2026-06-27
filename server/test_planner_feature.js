const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const Trip = require('./models/Trip');
const PendingAction = require('./models/PendingAction');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const { generateTravelPlan } = require('./services/aiPlannerService');

const API_CHAT = `http://localhost:${PORT}/api/ai/chat`;

async function sendPrompt(token, prompt) {
    try {
        const res = await axios.post(API_CHAT, { prompt, history: [] }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.response;
    } catch (err) {
        return `Error: ${err.message}`;
    }
}

async function runTests() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Setup
    await User.deleteMany({});
    await Trip.deleteMany({});
    await PendingAction.deleteMany({});
    
    const user = await User.create({ name: 'Test', username: 'tester', email: 'test@test.com', mobileNumber: '1234567890', password: 'password' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log("=========================================");
    console.log("TEST 1: Create a trip (No automatic planner)");
    console.log("=========================================");
    await sendPrompt(token, "create a trip");
    await sendPrompt(token, "Test Trip 1");
    await sendPrompt(token, "Paris");
    await sendPrompt(token, "London");
    await sendPrompt(token, "2026-10-01");
    await sendPrompt(token, "2026-10-05");
    await sendPrompt(token, "3000");
    await sendPrompt(token, "2");
    const t1Res = await sendPrompt(token, "yes");
    console.log(`Response: ${t1Res}\n`);

    console.log("=========================================");
    console.log("TEST 2: Generate itinerary (No bookings)");
    console.log("=========================================");
    const t2Res = await sendPrompt(token, "generate itinerary");
    console.log(`Response Snippet:\n${t2Res.substring(0, 300)}...\n`);
    
    console.log("=========================================");
    console.log("TEST 3: Generate itinerary twice");
    console.log("=========================================");
    const t3Res = await sendPrompt(token, "generate travel plan");
    console.log(`Response Snippet:\n${t3Res.substring(0, 300)}...\n`);
    const tripCount = await Trip.countDocuments({ userId: user._id });
    console.log(`Total Trips in DB: ${tripCount} (Expected: 1)\n`);

    console.log("=========================================");
    console.log("TEST 4: Trip with low budget");
    console.log("=========================================");
    await Trip.create({
        userId: user._id, tripName: 'Low Budget Trip', startingPoint: 'Delhi', destination: 'Agra',
        startDate: new Date('2026-11-01'), endDate: new Date('2026-11-03'), budget: 50, numberOfTravelers: 1
    });
    const t4Res = await sendPrompt(token, "plan my trip");
    console.log(`Response Snippet:\n${t4Res.substring(0, 300)}...\n`);

    console.log("=========================================");
    console.log("TEST 5: Trip with missing dates (Direct Service Test)");
    console.log("=========================================");
    // Mongoose schema requires dates, so we bypass saving to DB and pass a raw object to the service to test logic
    const missingDateTrip = {
        tripName: 'Missing Dates Trip', destination: 'Rome', startingPoint: 'Milan', budget: 1000, numberOfTravelers: 2
    };
    const t5Res = await generateTravelPlan(missingDateTrip);
    console.log(`Response: ${t5Res}\n`);

    process.exit(0);
}

runTests();
