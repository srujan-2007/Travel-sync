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

async function sendPrompt(token, prompt, outage = false) {
    try {
        const headers = { Authorization: `Bearer ${token}` };
        if (outage) headers['x-simulate-outage'] = 'true';
        
        const res = await axios.post(API_URL, {
            prompt,
            history: [],
            systemPrompt: "You are a helpful travel assistant."
        }, { headers });
        return res.data.response;
    } catch (e) {
        return "ERROR: " + (e.response?.data?.message || e.message);
    }
}

async function runTests() {
    await mongoose.connect(process.env.MONGO_URI);
    const token = await generateToken('QATester', 'qa@tester.com');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    await Trip.deleteMany({ userId });
    await PendingAction.deleteMany({ userId });

    console.log("=== STARTING COMPREHENSIVE QA AUDIT ===\n");

    // 1. CREATE & WORKFLOW INTERRUPTION
    console.log("TEST 1: CREATE & Workflow Interruption");
    await sendPrompt(token, "Create a trip to Kerala");
    let res = await sendPrompt(token, "explore hyderabad"); 
    console.log("- Expected tripName question (No interrupt)? ->", res.includes("starting point") ? "PASS" : "FAIL");
    res = await sendPrompt(token, "show my trips"); 
    console.log("- Expected explicit interrupt? ->", res.includes("already have a CREATE trip workflow") ? "PASS" : "FAIL");
    
    // 2. CANCELLATION
    console.log("\nTEST 2: Cancellation");
    res = await sendPrompt(token, "cancel");
    console.log("- Expected cancel? ->", res.includes("Action cancelled") ? "PASS" : "FAIL");

    // 3. VALIDATION FAILURES
    console.log("\nTEST 3: Validation Failures");
    await sendPrompt(token, "Create a Paris trip");
    await sendPrompt(token, "family vacation");
    await sendPrompt(token, "London");
    await sendPrompt(token, "2026-06-01");
    res = await sendPrompt(token, "2026-05-01");
    console.log("- EndDate <= StartDate rejected? ->", res.includes("must be after start date") ? "PASS" : "FAIL");
    await sendPrompt(token, "2026-06-10");
    res = await sendPrompt(token, "0");
    console.log("- Budget 0 rejected? ->", res.includes("positive number") ? "PASS" : "FAIL");
    res = await sendPrompt(token, "abc");
    console.log("- Budget abc rejected? ->", res.includes("positive number") ? "PASS" : "FAIL");
    await sendPrompt(token, "5000"); 
    res = await sendPrompt(token, "0");
    console.log("- Travelers 0 rejected? ->", res.includes("at least 1") ? "PASS" : "FAIL");
    await sendPrompt(token, "4"); 
    res = await sendPrompt(token, "yes");
    console.log("- Trip successfully created? ->", res.includes("Success! Trip") ? "PASS" : "FAIL");

    // Seed additional trips for tests
    await Trip.create({ userId, tripName: "Tokyo Drift", destination: "Tokyo", startingPoint: "LA", startDate: new Date("2026-08-01"), endDate: new Date("2026-08-10"), budget: 10000, numberOfTravelers: 2 });
    await Trip.create({ userId, tripName: "Tokyo Relax", destination: "Tokyo", startingPoint: "SF", startDate: new Date("2026-09-01"), endDate: new Date("2026-09-10"), budget: 5000, numberOfTravelers: 2 });

    // 4. READ & CONTEXT MEMORY
    console.log("\nTEST 4: READ & Context Memory");
    res = await sendPrompt(token, "How many trips do I have?");
    console.log("- Total Trips Count? ->", res.includes("total of 3 trip(s)") ? "PASS" : "FAIL");
    res = await sendPrompt(token, "What are those?");
    console.log("- Context Resolution (List)? ->", res.includes("family vacation") && res.includes("Tokyo Drift") ? "PASS" : "FAIL");
    res = await sendPrompt(token, "What is my highest budget trip?");
    console.log("- Highest Budget Filter? ->", res.includes("Tokyo Drift") ? "PASS" : "FAIL");

    // 5. UPDATE & AMBIGUOUS TRIP SELECTION
    console.log("\nTEST 5: UPDATE & Ambiguous Selection");
    res = await sendPrompt(token, "Update Tokyo");
    console.log("- Ambiguous Selection (Found multiple)? ->", res.includes("multiple trips") ? "PASS" : "FAIL", "| res:", res);
    res = await sendPrompt(token, "1"); // Select first (Tokyo Drift)
    console.log("- Selected successfully? ->", res.includes("Updating 'Tokyo Drift'") ? "PASS" : "FAIL", "| res:", res);
    await sendPrompt(token, "budget");
    res = await sendPrompt(token, "0");
    console.log("- Update Validation (0 rejected)? ->", res.includes("positive number") ? "PASS" : "FAIL", "| res:", res);
    await sendPrompt(token, "15000");
    res = await sendPrompt(token, "yes");
    console.log("- Update Completed? ->", res.includes("has been updated") ? "PASS" : "FAIL", "| res:", res);

    // 6. DELETE
    console.log("\nTEST 6: DELETE");
    await sendPrompt(token, "Delete Tokyo Relax");
    res = await sendPrompt(token, "yes");
    console.log("- Delete Completed? ->", res.includes("deleted successfully") ? "PASS" : "FAIL", "| res:", res);

    // 7. GENERAL CHAT
    console.log("\nTEST 7: General Chat");
    res = await sendPrompt(token, "hi");
    console.log("- General chat handled by Groq? ->", !res.includes("I didn't understand") ? "PASS" : "FAIL");

    // 8. LLM OUTAGE MODE
    console.log("\nTEST 8: LLM Outage Mode");
    res = await sendPrompt(token, "hi", true); // simulate outage
    console.log("- LLM Outage Handled safely? ->", res.includes("trouble connecting to my knowledge base") ? "PASS" : "FAIL");

    console.log("\nAll Tests Executed.");
    process.exit(0);
}

runTests();
