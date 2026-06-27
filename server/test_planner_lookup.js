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
    
    const user = await User.create({ name: 'Fallback Tester', username: 'fallbacktester', email: 'fallback@test.com', mobileNumber: '1234567890', password: 'password' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log("--- SEEDING ONE TRIP ---");
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1); // 1 year in the future
    
    await Trip.create({ 
        userId: user._id, tripName: 'fly to paris', destination: 'Paris', 
        startingPoint: 'London', startDate: futureDate, 
        endDate: new Date(futureDate.getTime() + 5*24*60*60*1000), 
        budget: 3000, numberOfTravelers: 2 
    });

    console.log("TEST 1: Conversational Edit on EXISTING trip");
    await sendPrompt(token, "trip name: fly to paris , can you edit this trip");
    await PendingAction.deleteMany({}); 

    console.log("TEST 2: Conversational Edit on NON-EXISTENT trip");
    await sendPrompt(token, "trip name: fly to america , can you edit this trip");
    await PendingAction.deleteMany({});

    console.log("TEST 3: Generate Plan for EXISTING upcoming trip");
    await sendPrompt(token, "can you plan my trip for fly to paris");
    await PendingAction.deleteMany({});

    console.log("TEST 4: Generate Plan for NON-EXISTENT trip");
    await sendPrompt(token, "can you also plan my trip for fly to america");

    console.log("TEST 5: Continuing CREATE_TRIP flow after planner redirection");
    // The bot should have asked "What should be the trip name?"
    await sendPrompt(token, "fly to america");
    await sendPrompt(token, "America"); // Destination

    process.exit(0);
}

runTests();
