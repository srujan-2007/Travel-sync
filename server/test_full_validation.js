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

async function sendPrompt(token, prompt, history = []) {
    try {
        const res = await axios.post(API_URL, {
            prompt,
            history,
            systemPrompt: "You are a helpful travel assistant."
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data.response;
    } catch (e) {
        console.error(`Error on prompt "${prompt}":`, e.response?.data || e.message);
        return "ERROR";
    }
}

async function runValidation() {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URI);

    const tokenA = await generateToken('UserA', 'usera@test.com');
    const tokenB = await generateToken('UserB', 'userb@test.com');
    
    const decodedA = jwt.verify(tokenA, process.env.JWT_SECRET);
    const userIdA = decodedA.userId;

    // Reset State
    await Trip.deleteMany({ userId: userIdA });
    await PendingAction.deleteMany({ userId: userIdA });

    console.log("\n=========================");
    console.log("1. GENERAL AI BEHAVIOR");
    console.log("=========================");
    console.log("User: Hi ->", await sendPrompt(tokenA, "Hi"));
    console.log("User: Tell me a joke ->", await sendPrompt(tokenA, "Tell me a joke"));

    console.log("\n=========================");
    console.log("2. TRAVEL ASSISTANT BEHAVIOR");
    console.log("=========================");
    console.log("User: Best places to visit in Japan ->", await sendPrompt(tokenA, "Best places to visit in Japan"));

    console.log("\n=========================");
    console.log("3. CREATE TRIP & INTERRUPTIONS");
    console.log("=========================");
    console.log("User: Create a Mumbai trip ->", await sendPrompt(tokenA, "Create a Mumbai trip"));
    console.log("User: Update Goa (Interrupt) ->", await sendPrompt(tokenA, "Update Goa"));
    console.log("User: cancel ->", await sendPrompt(tokenA, "cancel"));
    console.log("User: Create a Goa trip ->", await sendPrompt(tokenA, "Create a Goa trip"));
    console.log("User: Hi (Interrupt) ->", await sendPrompt(tokenA, "Hi"));
    console.log("User: What is the capital of France? ->", await sendPrompt(tokenA, "What is the capital of France?"));
    console.log("User: Goa Vacation (Resume) ->", await sendPrompt(tokenA, "Goa Vacation")); // tripName
    console.log("User: Hyderabad ->", await sendPrompt(tokenA, "Hyderabad")); // startingPoint
    console.log("User: 2026-08-01 ->", await sendPrompt(tokenA, "2026-08-01")); // startDate
    console.log("User: 2026-08-05 ->", await sendPrompt(tokenA, "2026-08-05")); // endDate
    console.log("User: 10000 ->", await sendPrompt(tokenA, "10000")); // budget
    console.log("User: 2 ->", await sendPrompt(tokenA, "2")); // travelers
    console.log("User: yes ->", await sendPrompt(tokenA, "yes")); // confirm

    // Add more trips directly for reading tests
    await Trip.create({ userId: userIdA, tripName: "Paris Getaway", destination: "Paris", startingPoint: "New York", startDate: new Date("2026-10-01"), endDate: new Date("2026-10-10"), budget: 5000, numberOfTravelers: 2 });
    await Trip.create({ userId: userIdA, tripName: "Tokyo Adventure", destination: "Tokyo", startingPoint: "SF", startDate: new Date("2026-12-01"), endDate: new Date("2026-12-15"), budget: 8000, numberOfTravelers: 1 });

    console.log("\n=========================");
    console.log("4. READ WORKFLOW & REASONING");
    console.log("=========================");
    console.log("User: Show my trips ->\n", await sendPrompt(tokenA, "Show my trips"));
    console.log("User: What is my highest budget trip? ->", await sendPrompt(tokenA, "What is my highest budget trip?"));
    console.log("User: How many trips do I have? ->", await sendPrompt(tokenA, "How many trips do I have?"));

    console.log("\n=========================");
    console.log("5. FOLLOW-UP CONTEXT");
    console.log("=========================");
    console.log("User: What are those? ->\n", await sendPrompt(tokenA, "What are those?"));
    
    console.log("User: Do I have any Goa trips? ->", await sendPrompt(tokenA, "Do I have any Goa trips?"));
    console.log("User: Show them. ->\n", await sendPrompt(tokenA, "Show them."));

    // Add explicit test trip
    await Trip.create({ userId: userIdA, tripName: "Kerala Backwater Retreat", destination: "Kerala", startingPoint: "Kochi", startDate: new Date("2026-11-01"), endDate: new Date("2026-11-05"), budget: 20000, numberOfTravelers: 2 });

    console.log("\n=========================");
    console.log("6. UPDATE & DELETE WORKFLOWS (Exact Match Check)");
    console.log("=========================");
    console.log("User: Update Kerala Backwater Retreat ->", await sendPrompt(tokenA, "Update Kerala Backwater Retreat"));
    console.log("User: budget ->", await sendPrompt(tokenA, "budget"));
    console.log("User: 25000 ->", await sendPrompt(tokenA, "25000"));
    console.log("User: yes ->", await sendPrompt(tokenA, "yes"));
    
    console.log("User: Delete Kerala Backwater Retreat ->", await sendPrompt(tokenA, "Delete Kerala Backwater Retreat"));
    console.log("User: yes ->", await sendPrompt(tokenA, "yes"));

    console.log("User: Update Goa ->\n", await sendPrompt(tokenA, "Update Goa"));
    
    console.log("\n=========================");
    console.log("8. READ TRIP NAMES ONLY");
    console.log("=========================");
    console.log("User: show my trip names ->\n", await sendPrompt(tokenA, "show my trip names"));

    console.log("\n=========================");
    console.log("7. USER ISOLATION");
    console.log("=========================");
    console.log("User B: Show my trips ->", await sendPrompt(tokenB, "Show my trips"));

    console.log("Tests Complete.");
    process.exit(0);
}

runValidation();
