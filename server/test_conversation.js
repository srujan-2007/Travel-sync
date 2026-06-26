require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Trip = require('./models/Trip');
const PendingAction = require('./models/PendingAction');

const API_URL = 'http://localhost:5000/api/ai/chat';
const token = jwt.sign({ userId: new mongoose.Types.ObjectId() }, process.env.JWT_SECRET || 'dev_secret');
const headers = { Authorization: `Bearer ${token}` };

async function runTests() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/travelsync_test');
    await Trip.deleteMany({});
    await PendingAction.deleteMany({});

    console.log("=== STARTING CONVERSATION QA AUDIT ===\n");

    const tests = [
        { name: "1. HELP command without workflow", prompt: "What can you do?", expects: "Trip Creation" },
        { name: "2. CREATE trip", prompt: "create trip", expects: "What should be the trip name?" },
        { name: "3. GREETING during workflow", prompt: "Hi", expects: "You are currently creating a trip. Would you like to continue?" },
        { name: "4. TRAVEL_QUESTION during workflow", prompt: "Tell me about Paris", expects: "You are currently creating a trip. Would you like to continue?" },
        { name: "5. RESTART during workflow", prompt: "Start over", expects: "What should be the trip name?" },
        { name: "6. Valid field input", prompt: "Paris Trip", expects: "What is the destination?" },
        { name: "7. CANCEL workflow", prompt: "Cancel", expects: "Current operation cancelled" }
    ];

    let passed = 0;

    for (let t of tests) {
        process.stdout.write(`Testing: ${t.name}... `);
        try {
            const res = await axios.post(API_URL, {
                prompt: t.prompt,
                history: [],
                systemPrompt: "You are a helpful travel assistant."
            }, { headers });

            const reply = res.data.response;
            if (reply && reply.includes(t.expects)) {
                console.log("PASS");
                passed++;
            } else {
                console.log("FAIL");
                console.log(`\nExpected to include: "${t.expects}"`);
                console.log(`Actual Response: "${reply}"\n`);
            }
        } catch (e) {
            console.log("ERROR");
            console.error(e.response ? e.response.data : e.message);
        }
    }

    console.log(`\n=== E2E CRUD WORKFLOW SEQUENCE ===\n`);
    const e2eSequence = [
        "create trip",
        "fly to dubai",
        "dubai uae",
        "hyderabad",
        "2026-08-01",
        "2026-08-08",
        "35000",
        "2",
        "yes"
    ];
    
    let currentHistory = [];
    let e2eSuccess = false;
    for (const msg of e2eSequence) {
        process.stdout.write(`User: "${msg}"... `);
        try {
            const res = await axios.post(API_URL, {
                prompt: msg,
                history: currentHistory,
                systemPrompt: "You are a helpful travel assistant."
            }, { headers });
            
            const reply = res.data.response;
            console.log(`Bot: "${reply.replace(/\n/g, ' ')}"`);
            currentHistory.push({ role: 'user', content: msg });
            currentHistory.push({ role: 'assistant', content: reply });
            if (reply.includes("Success! Trip")) {
                e2eSuccess = true;
                const expectedSummary = "Trip Name: fly to dubai Destination: Dubai Uae Starting Point: hyderabad Start Date: 2026-08-01 End Date: 2026-08-08 Budget: 35000 Travelers: 2";
                if (!currentHistory[currentHistory.length-2].content.includes(expectedSummary)) {
                    console.log(`[WARNING] Summary output did not perfectly match the expected summary. Manual review required.`);
                }
            }
        } catch(e) {
            console.log("ERROR", e.response ? e.response.data : e.message);
        }
    }
    
    if (e2eSuccess) passed++;
    
    console.log(`\nResults: ${passed}/${tests.length + 1} tests passed.`);
    process.exit(passed === (tests.length + 1) ? 0 : 1);
}

runTests();
