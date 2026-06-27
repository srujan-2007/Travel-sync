const mongoose = require('mongoose');
require('dotenv').config();
const { generateTravelPlan } = require('./services/aiPlannerService');
const Trip = require('./models/Trip');

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    const trip = await Trip.findOne({ tripName: new RegExp('fly to dubai', 'i') });
    console.log('Trip from DB:', trip);
    console.log('\nExecuting generateTravelPlan...');
    const plan = await generateTravelPlan(trip);
    console.log('----- OUTPUT -----');
    console.log(plan);
    console.log('------------------');
    process.exit(0);
}

test();
