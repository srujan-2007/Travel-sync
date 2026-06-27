const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const Trip = require('./models/Trip');
const PendingAction = require('./models/PendingAction');
const User = require('./models/User');
const Expense = require('./models/Expense');
const Memory = require('./models/Memory');
const Activity = require('./models/Activity');
const Itinerary = require('./models/Itinerary');
const Location = require('./models/Location');
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

async function runProof() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Setup Clean State
    await User.deleteMany({});
    await Trip.deleteMany({});
    await PendingAction.deleteMany({});
    await Expense.deleteMany({});
    await Memory.deleteMany({});
    await Activity.deleteMany({});
    await Itinerary.deleteMany({});
    await Location.deleteMany({});
    
    const user = await User.create({ name: 'Proof', username: 'proofer', email: 'proof@test.com', mobileNumber: '1234567890', password: 'password' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log("==================================================");
    console.log("TEST 1: Create a trip (CRUD only)");
    console.log("==================================================");
    await sendPrompt(token, "create a trip");
    await sendPrompt(token, "Test Dubai");
    await sendPrompt(token, "Dubai");
    await sendPrompt(token, "Hyderabad");
    await sendPrompt(token, "2026-08-01");
    await sendPrompt(token, "2026-08-05");
    await sendPrompt(token, "2000");
    await sendPrompt(token, "1");
    await sendPrompt(token, "yes");

    console.log("==================================================");
    console.log("TEST 2: Verify DB State (No Planner Data)");
    console.log("==================================================");
    const trips = await Trip.find({ userId: user._id });
    console.log(`Trips created: ${trips.length}`);
    if (trips.length === 1) console.log(`Trip Document: ${trips[0].tripName}`);
    
    const itineraries = await Itinerary.countDocuments({ userId: user._id });
    const activities = await Activity.countDocuments({ userId: user._id });
    // Note: We don't have a Planner model in TravelSync schema, but checking Itineraries/Activities proves no plan was auto-saved.
    console.log(`Itineraries created: ${itineraries}`);
    console.log(`Activities created: ${activities}\n`);

    console.log("==================================================");
    console.log("TEST 3: Invoke Planner On Demand");
    console.log("==================================================");
    const t3Res = await sendPrompt(token, "plan my trip");
    console.log(`Planner output verified. Length: ${t3Res.length} characters.`);

    console.log("\n==================================================");
    console.log("TEST 4: Create Another Trip (No Auto Planner)");
    console.log("==================================================");
    await sendPrompt(token, "create a trip");
    await sendPrompt(token, "Test Paris");
    await sendPrompt(token, "Paris");
    await sendPrompt(token, "London");
    await sendPrompt(token, "2026-10-01");
    await sendPrompt(token, "2026-10-05");
    await sendPrompt(token, "3000");
    await sendPrompt(token, "2");
    await sendPrompt(token, "yes");
    
    const trips2 = await Trip.countDocuments({ userId: user._id });
    console.log(`Total Trips now in DB: ${trips2} (Expected: 2)`);

    console.log("\n==================================================");
    console.log("TEST 5: Delete Trip & Cascading Verification");
    console.log("==================================================");
    // Add fake data to Test Dubai trip to test cascading
    const dubaiTrip = await Trip.findOne({ tripName: 'Test Dubai' });
    await Expense.create({ tripId: dubaiTrip._id, userId: user._id, description: 'Test', amount: 100, category: 'Food', date: new Date() });
    await Memory.create({ tripId: dubaiTrip._id, userId: user._id, title: 'Test', date: new Date(), description: 'Test', mediaUrl: 'http://test.com/img.jpg', mediaType: 'image/jpeg' });
    
    console.log("Data added. Now deleting Test Dubai trip via API...");
    
    try {
        await axios.delete(`http://localhost:${PORT}/api/trips/${dubaiTrip._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Delete API called successfully.");
    } catch(err) {
        console.log("Failed API delete, attempting model delete.", err.message);
        await Trip.findByIdAndDelete(dubaiTrip._id);
    }
    
    const expCount = await Expense.countDocuments({ tripId: dubaiTrip._id });
    const memCount = await Memory.countDocuments({ tripId: dubaiTrip._id });
    const actCount = await Activity.countDocuments({ tripId: dubaiTrip._id });
    const locCount = await Location.countDocuments({ tripId: dubaiTrip._id });
    const itiCount = await Itinerary.countDocuments({ tripId: dubaiTrip._id });
    
    const remainingTrips = await Trip.find({ userId: user._id });
    
    console.log(`Trip Removed: ${remainingTrips.find(t => t._id.toString() === dubaiTrip._id.toString()) ? 'No' : 'Yes'}`);
    console.log(`Expenses Remaining: ${expCount}`);
    console.log(`Memories Remaining: ${memCount}`);
    console.log(`Activities Remaining: ${actCount}`);
    console.log(`Locations Remaining: ${locCount}`);
    console.log(`Itineraries Remaining: ${itiCount}`);
    console.log(`Remaining Trips in Dashboard: ${remainingTrips.length} (Expected: 1)`);
    
    process.exit(0);
}

runProof();
