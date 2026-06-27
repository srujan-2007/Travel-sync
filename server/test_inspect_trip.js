const mongoose = require('mongoose');
require('dotenv').config();
const Trip = require('./models/Trip');

async function checkTrip() {
    await mongoose.connect(process.env.MONGO_URI);
    const trips = await Trip.find({ tripName: new RegExp('fly to dubai', 'i') });
    console.log("=== TRIPS FOUND ===");
    trips.forEach(t => {
        console.log({
            name: t.tripName,
            destination: t.destination,
            startDate: t.startDate,
            endDate: t.endDate,
            budget: t.budget,
            travelers: t.numberOfTravelers
        });
    });
    process.exit(0);
}
checkTrip();
