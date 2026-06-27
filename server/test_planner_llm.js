const { generateTravelPlan } = require('./services/aiPlannerService');
require('dotenv').config();

async function test() {
    const mockTrip = {
        tripName: 'fly to dubai',
        destination: 'Dubai',
        startingPoint: 'London',
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-10-05'),
        budget: 5000,
        numberOfTravelers: 2
    };

    console.log("Executing generateTravelPlan...");
    const plan = await generateTravelPlan(mockTrip);
    console.log("----- OUTPUT -----");
    console.log(plan);
    console.log("------------------");
    process.exit(0);
}

test();
