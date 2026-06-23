const mongoose = require('mongoose');
require('dotenv').config();
const Trip = require('./models/Trip');

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Create a mock user
    const userId = new mongoose.Types.ObjectId();
    
    await Trip.create({ userId, tripName: 'Goa Vacation', destination: 'Goa', startingPoint: 'Hyderabad', startDate: new Date(), endDate: new Date(), budget: 10000, numberOfTravelers: 2 });
    await Trip.create({ userId, tripName: 'Konkan Coastal Adventure', destination: 'Goa', startingPoint: 'Mumbai', startDate: new Date(), endDate: new Date(), budget: 15000, numberOfTravelers: 4 });
    
    const prompt = 'Update Goa';
    let searchTerm = prompt.replace(/\b(?:change|update|modify|edit)\b/i, '').replace(/\b(?:my|a|the)\b/i, '').replace(/\btrips?\b/i, '').trim();
    
    const safeTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const query = { userId };
    query.$or = [
        { tripName: new RegExp(safeTerm, 'i') },
        { destination: new RegExp(safeTerm, 'i') }
    ];
    
    const trips = await Trip.find(query);
    console.log('Found trips:', trips.length);
    trips.forEach(t => console.log(t.tripName, t.destination));
    
    process.exit(0);
}
test();
