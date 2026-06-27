const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const Trip = require('./models/Trip');
const PendingAction = require('./models/PendingAction');
const User = require('./models/User');
const Expense = require('./models/Expense');
const jwt = require('jsonwebtoken');

const API_CHAT = `http://localhost:${PORT}/api/ai/chat`;

async function sendPrompt(token, prompt) {
    console.log(`User: ${prompt}`);
    try {
        // Send true to simulateOutage header to forcefully hit the regex intents if needed, 
        // though our prompt should be clear enough for the LLM. We will just use the standard LLM path.
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
    await Expense.deleteMany({});
    
    const user = await User.create({ name: 'Lookup Tester', username: 'lookuptester', email: 'lookup@test.com', mobileNumber: '1234567890', password: 'password' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log("--- SEEDING TRIPS ---");
    const trip1 = await Trip.create({ userId: user._id, tripName: 'fly to paris', destination: 'Paris', startingPoint: 'London', startDate: new Date('2026-10-01'), endDate: new Date('2026-10-05'), budget: 3000, numberOfTravelers: 2 });
    const trip2 = await Trip.create({ userId: user._id, tripName: 'dubai vacation', destination: 'Dubai', startingPoint: 'Delhi', startDate: new Date('2026-11-01'), endDate: new Date('2026-11-05'), budget: 2000, numberOfTravelers: 1 });
    
    // Add fake expense to prove cascading
    await Expense.create({ tripId: trip1._id, userId: user._id, description: 'Test Expense', amount: 100, category: 'Food', date: new Date() });

    console.log("1. show details lists trips.");
    await sendPrompt(token, "show details");

    console.log("2. edit the trip \"fly to paris\" starts the update workflow.");
    await sendPrompt(token, 'edit the trip "fly to paris"');
    await PendingAction.deleteMany({}); // clear state for next test

    console.log("3. edit the trip : fly to paris also works.");
    await sendPrompt(token, 'edit the trip : fly to paris');
    await PendingAction.deleteMany({}); // clear state

    console.log("4. delete the trip \"fly to paris\" asks for confirmation.");
    await sendPrompt(token, 'delete the trip "fly to paris"');
    
    console.log("5. delete the trip asks the user to choose from existing trips.");
    await PendingAction.deleteMany({}); // clear state
    await sendPrompt(token, 'delete the trip');
    await PendingAction.deleteMany({}); // clear state

    console.log("6. After confirmation, the trip is deleted and no orphaned records remain.");
    // We trigger the confirmation flow directly
    await sendPrompt(token, 'delete the trip "fly to paris"');
    await sendPrompt(token, 'yes');

    // Verify deletion
    const tripsRemaining = await Trip.countDocuments({ userId: user._id });
    const expensesRemaining = await Expense.countDocuments({ tripId: trip1._id });

    console.log(`\nTrips remaining: ${tripsRemaining} (Expected: 1)`);
    console.log(`Orphaned Expenses: ${expensesRemaining} (Expected: 0)`);

    process.exit(0);
}

runTests();
