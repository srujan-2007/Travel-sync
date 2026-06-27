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
        console.log(`Bot:\n${res.data.response}\n`);
        return res.data.response;
    } catch (err) {
        console.error(`Error: ${err.message}\n`);
        return null;
    }
}

async function runTests() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const user = await User.findOne({ username: 'adhoctester' }) || await User.findOne({});
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log("TEST: Exact User Prompt");
    await sendPrompt(token, "trip name: fly to dubai , can you plan my trip"); 

    process.exit(0);
}

runTests();
