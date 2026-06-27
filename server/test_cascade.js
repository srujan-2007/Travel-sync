const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const Trip = require('./models/Trip');
const Expense = require('./models/Expense');
const Memory = require('./models/Memory');
const Activity = require('./models/Activity');
const Location = require('./models/Location');
const Itinerary = require('./models/Itinerary');
const PendingAction = require('./models/PendingAction');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const API_CHAT = `http://localhost:${PORT}/api/ai/chat`;
const API_ANALYTICS = `http://localhost:${PORT}/api/analytics/summary`;

async function sendPrompt(token, prompt) {
    const res = await axios.post(API_CHAT, { prompt, history: [] }, {
        headers: { Authorization: `Bearer ${token}`, 'x-simulate-outage': 'true' }
    });
    return res.data.response;
}

async function getDashboard(token) {
    const res = await axios.get(API_ANALYTICS, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

async function runManualTest() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for E2E Cascade Test.");
    
    // Setup
    await User.deleteMany({});
    await Trip.deleteMany({});
    await Expense.deleteMany({});
    await Memory.deleteMany({});
    await Activity.deleteMany({});
    await Location.deleteMany({});
    await Itinerary.deleteMany({});
    await PendingAction.deleteMany({});
    
    const user = await User.create({ name: 'Test', username: 'tester', email: 'test@test.com', mobileNumber: '1234567890', password: 'password' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log("\n1. CREATING TRIP...");
    const trip = await Trip.create({
        userId: user._id,
        tripName: 'Cascade Test Trip',
        startingPoint: 'New York',
        destination: 'Paris',
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-10-10'),
        budget: 5000,
        numberOfTravelers: 2
    });
    console.log(`✅ Trip Created: ${trip._id}`);

    console.log("\n2. CREATING LINKED DATA (Expenses, Memories, Activities, Locations, Itineraries)...");
    await Expense.create({ userId: user._id, tripId: trip._id, category: 'Food', amount: 500, date: new Date() });
    await Memory.create({ userId: user._id, tripId: trip._id, mediaType: 'Photo', mediaUrl: 'test.jpg', date: new Date() });
    await Activity.create({ userId: user._id, tripId: trip._id, activityName: 'Eiffel Tower', place: 'Paris', date: new Date(), time: '10:00' });
    await Location.create({ userId: user._id, tripId: trip._id, placeName: 'Louvre', visitDate: new Date(), visitTime: '12:00' });
    await Itinerary.create({ userId: user._id, tripId: trip._id, dayNumber: 1, place: 'Paris', activity: 'Walk', time: '09:00' });
    
    const expenseCountPre = await Expense.countDocuments({ tripId: trip._id });
    console.log(`✅ Linked Data Saved. Expenses count: ${expenseCountPre}`);

    console.log("\n3. FETCHING DASHBOARD (PRE-DELETION)...");
    const dashPre = await getDashboard(token);
    console.log(`📊 Trips: ${dashPre.totalTrips}, Total Budget: $${dashPre.totalBudget}, Expenses: $${dashPre.totalExpenses}, Remaining: $${dashPre.remainingBudget}`);

    console.log("\n4. DELETING TRIP VIA AI CHAT...");
    const res1 = await sendPrompt(token, "Delete trip");
    console.log(`🤖 AI (Delete trigger): ${res1}`);
    const delRes = await sendPrompt(token, "Yes"); 
    console.log(`🤖 AI (Confirmation): ${delRes}`);

    console.log("\n5. VERIFYING ORPHANED DATA DELETION...");
    const tripCountPost = await Trip.countDocuments({ _id: trip._id });
    const expCountPost = await Expense.countDocuments({ tripId: trip._id });
    const memCountPost = await Memory.countDocuments({ tripId: trip._id });
    const actCountPost = await Activity.countDocuments({ tripId: trip._id });
    const locCountPost = await Location.countDocuments({ tripId: trip._id });
    const itiCountPost = await Itinerary.countDocuments({ tripId: trip._id });

    console.log(`- Trip Count: ${tripCountPost}`);
    console.log(`- Expense Count: ${expCountPost}`);
    console.log(`- Memory Count: ${memCountPost}`);
    console.log(`- Activity Count: ${actCountPost}`);
    console.log(`- Location Count: ${locCountPost}`);
    console.log(`- Itinerary Count: ${itiCountPost}`);

    console.log("\n6. FETCHING DASHBOARD (POST-DELETION)...");
    const dashPost = await getDashboard(token);
    console.log(`📊 Trips: ${dashPost.totalTrips}, Total Budget: $${dashPost.totalBudget}, Expenses: $${dashPost.totalExpenses}, Remaining: $${dashPost.remainingBudget}`);

    if (expCountPost === 0 && memCountPost === 0 && dashPost.remainingBudget === 0) {
        console.log("\n🎉 SUCCESS! Cascading deletion works and the dashboard is stable.");
    } else {
        console.log("\n❌ FAILURE! Orphaned data detected or Dashboard corrupted.");
        process.exit(1);
    }

    process.exit(0);
}

runManualTest().catch(err => {
    console.error(err);
    process.exit(1);
});
