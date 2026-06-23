const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Trip = require('./models/Trip');
const PendingAction = require('./models/PendingAction');

async function sendPrompt(token, prompt, simulateOutage = false) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    if (simulateOutage) {
        headers['x-simulate-outage'] = 'true';
    }

    const res = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    return data.response || JSON.stringify(data);
}

async function runTests() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const userId = new mongoose.Types.ObjectId();
    const token = jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Clean up
    await Trip.deleteMany({ userId });
    await PendingAction.deleteMany({ userId });

    console.log("\n==================================================");
    console.log("PHASE 1: CRUD WORKFLOW TESTING");
    console.log("==================================================");

    console.log("\n--- 1.1 CREATE Workflow Test ---");
    console.log("Prompt: 'Create Kerala trip'");
    console.log("System Response:", await sendPrompt(token, "Create Kerala trip"));

    // Expected: Ask for trip name. Let's send invalid field inputs/system keywords to verify rejection.
    const reservedWords = ['continue', 'yes', 'no', 'Update Goa', 'Delete Goa', 'Show my trips', 'Tell me a joke'];
    for (const word of reservedWords) {
        console.log(`Sending reserved/command keyword: "${word}"`);
        const resp = await sendPrompt(token, word);
        console.log(`System Response:`, resp);
    }

    // Check database to ensure no corruption of tripName occurred
    let pa = await PendingAction.findOne({ userId });
    console.log("Current PendingAction step:", pa.step);
    console.log("Current Trip Name value in data (should be null/empty or valid only):", pa.data.tripName);

    // Cancel workflow
    console.log("Cancelling CREATE workflow...");
    console.log("System Response:", await sendPrompt(token, "cancel"));
    pa = await PendingAction.findOne({ userId });
    console.log("PendingAction after cancel (should be null):", pa);


    console.log("\n--- 1.2 UPDATE Workflow Disambiguation Menu Test ---");
    // Create multiple Goa trips
    const trip1 = await Trip.create({
        userId,
        tripName: "Goa Beach Party",
        destination: "Goa",
        startingPoint: "Mumbai",
        startDate: new Date("2026-10-01"),
        endDate: new Date("2026-10-05"),
        budget: 5000,
        numberOfTravelers: 2
    });
    const trip2 = await Trip.create({
        userId,
        tripName: "Goa Yoga Retreat",
        destination: "Goa",
        startingPoint: "Delhi",
        startDate: new Date("2026-11-10"),
        endDate: new Date("2026-11-15"),
        budget: 12000,
        numberOfTravelers: 3
    });

    console.log("Prompt: 'Update Goa'");
    let resp = await sendPrompt(token, "Update Goa");
    console.log("System Response:\n", resp);
    // Should display a numbered selection list:
    // 1. Goa Beach Party
    // 2. Goa Yoga Retreat

    // Test selection menu workflow overrides/interruption while active
    console.log("Prompt: 'yes' (override attempt)");
    console.log("System Response:", await sendPrompt(token, "yes"));

    console.log("Prompt: 'continue' (override attempt)");
    console.log("System Response:", await sendPrompt(token, "continue"));

    console.log("Prompt: 'Delete Goa' (command override attempt)");
    console.log("System Response:", await sendPrompt(token, "Delete Goa"));

    // Select trip 1
    console.log("Prompt: '1' (Select Goa Beach Party)");
    console.log("System Response:", await sendPrompt(token, "1"));

    // Select field
    console.log("Prompt: 'budget'");
    console.log("System Response:", await sendPrompt(token, "budget"));

    // Try system keywords instead of budget value
    console.log("Prompt: 'yes' (override attempt)");
    console.log("System Response:", await sendPrompt(token, "yes"));

    // Provide new budget value
    console.log("Prompt: '6000'");
    console.log("System Response:", await sendPrompt(token, "6000"));

    // Confirm update
    console.log("Prompt: 'yes' (Confirm change)");
    console.log("System Response:", await sendPrompt(token, "yes"));

    // Verify database update
    const updatedTrip1 = await Trip.findById(trip1._id);
    console.log("Updated Trip 1 Budget (should be 6000):", updatedTrip1.budget);


    console.log("\n--- 1.3 DELETE Workflow Disambiguation Menu & Confirmation Test ---");
    console.log("Prompt: 'Delete Goa'");
    resp = await sendPrompt(token, "Delete Goa");
    console.log("System Response:\n", resp);

    // Confirmation loop cancel test
    console.log("Prompt: '1' (Select Goa Beach Party)");
    console.log("System Response:", await sendPrompt(token, "1"));

    console.log("Prompt: 'no' (Cancel confirmation)");
    console.log("System Response:", await sendPrompt(token, "no"));

    // Ensure it was not deleted
    let checkTrip = await Trip.findById(trip1._id);
    console.log("Trip 1 still exists after cancel 'no'?:", !!checkTrip);

    console.log("Prompt: 'Delete Goa'");
    await sendPrompt(token, "Delete Goa");
    console.log("Prompt: '1'");
    await sendPrompt(token, "1");
    console.log("Prompt: 'yes' (Confirm deletion)");
    console.log("System Response:", await sendPrompt(token, "yes"));

    // Ensure it was deleted
    checkTrip = await Trip.findById(trip1._id);
    console.log("Trip 1 still exists after confirm 'yes'?:", !!checkTrip);


    console.log("\n==================================================");
    console.log("PHASE 2: VALIDATION TESTS");
    console.log("==================================================");
    console.log("Starting a new CREATE workflow...");
    await sendPrompt(token, "Create a Paris trip");
    await sendPrompt(token, "Paris Tour");
    await sendPrompt(token, "London");
    await sendPrompt(token, "2026-12-01");

    console.log("\n--- 2.1 Date Validation (End before Start) ---");
    console.log("Prompt: '2026-11-30' (Invalid end date)");
    console.log("System Response:", await sendPrompt(token, "2026-11-30"));
    console.log("Prompt: '2026-12-10' (Valid end date)");
    console.log("System Response:", await sendPrompt(token, "2026-12-10"));

    console.log("\n--- 2.2 Budget Validation (NaN, Negative, Zero) ---");
    console.log("Prompt: 'abc' (NaN)");
    console.log("System Response:", await sendPrompt(token, "abc"));
    console.log("Prompt: '-100' (Negative)");
    console.log("System Response:", await sendPrompt(token, "-100"));
    console.log("Prompt: '5000' (Valid)");
    console.log("System Response:", await sendPrompt(token, "5000"));

    console.log("\n--- 2.3 Travelers Validation (NaN, Negative, Zero) ---");
    console.log("Prompt: 'hello' (NaN)");
    console.log("System Response:", await sendPrompt(token, "hello"));
    console.log("Prompt: '0' (Zero)");
    console.log("System Response:", await sendPrompt(token, "0"));
    console.log("Prompt: '-5' (Negative)");
    console.log("System Response:", await sendPrompt(token, "-5"));
    console.log("Prompt: '3' (Valid)");
    console.log("System Response:", await sendPrompt(token, "3"));

    console.log("Confirming trip creation...");
    console.log("System Response:", await sendPrompt(token, "yes"));


    console.log("\n==================================================");
    console.log("PHASE 3 & 5: CONTEXT MEMORY & GROQ FAILURE TESTING");
    console.log("==================================================");
    // Let's run a complete conversational context resolution sequence simulating Groq outage!
    console.log("Prompt: 'Show my trips' (Outage)");
    console.log("System Response:\n", await sendPrompt(token, "Show my trips", true));

    console.log("Prompt: 'How many trips do I have?' (Outage)");
    console.log("System Response:\n", await sendPrompt(token, "How many trips do I have?", true));

    console.log("Prompt: 'What are those?' (Outage)");
    console.log("System Response:\n", await sendPrompt(token, "What are those?", true));

    console.log("Prompt: 'What is my highest budget trip?' (Outage)");
    console.log("System Response:\n", await sendPrompt(token, "What is my highest budget trip?", true));

    console.log("Prompt: 'Tell me more about it' (Outage)");
    console.log("System Response:\n", await sendPrompt(token, "Tell me more about it", true));

    console.log("Prompt: 'Do I have any Goa trips?' (Outage)");
    console.log("System Response:\n", await sendPrompt(token, "Do I have any Goa trips?", true));

    console.log("Prompt: 'Show them' (Outage)");
    console.log("System Response:\n", await sendPrompt(token, "Show them", true));


    console.log("\n==================================================");
    console.log("PHASE 4: WORKFLOW INTERRUPTION TESTS");
    console.log("==================================================");
    console.log("Starting a new CREATE workflow...");
    await sendPrompt(token, "Create a Mumbai trip");

    const commands = ['Update Goa', 'Delete Goa', 'Show my trips', 'How many trips do I have?', 'Tell me a joke'];
    for (const cmd of commands) {
        console.log(`Sending interruption: "${cmd}"`);
        console.log("System Response:", await sendPrompt(token, cmd));
    }

    console.log("Cancelling CREATE workflow...");
    await sendPrompt(token, "cancel");


    console.log("\n==================================================");
    console.log("PHASE 6: DATABASE STATE CLEANUP TESTS");
    console.log("==================================================");
    const pendingActionsCount = await PendingAction.countDocuments({ userId });
    console.log("Number of PendingAction records left (should be 0 or 1 CONTEXT only):", pendingActionsCount);
    const leftPA = await PendingAction.findOne({ userId });
    if (leftPA) {
        console.log("Leftover PendingAction type:", leftPA.action);
    }

    const corruptedTrips = await Trip.find({
        userId,
        $or: [
            { tripName: { $in: reservedWords } },
            { destination: { $in: reservedWords } },
            { startingPoint: { $in: reservedWords } }
        ]
    });
    console.log("Number of corrupted trips found in DB (should be 0):", corruptedTrips.length);

    console.log("\n--- Testing Complete ---");
    process.exit(0);
}

runTests().catch(err => {
    console.error(err);
    process.exit(1);
});
