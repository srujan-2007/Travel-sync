const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Trip = require('./models/Trip');
const Itinerary = require('./models/Itinerary');
const Activity = require('./models/Activity');
const Expense = require('./models/Expense');
const Memory = require('./models/Memory');
const Location = require('./models/Location');

async function seed() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        // 1. Find or create demo user
        let user = await User.findOne({ username: 'ecanjali22@gmail.com' });
        if (!user) {
            console.log("Demo user ecanjali22@gmail.com not found. Creating...");
            user = await User.create({
                name: 'Anjali Demo',
                username: 'ecanjali22@gmail.com',
                mobileNumber: '9876543210',
                provider: 'local'
            });
            console.log("Demo user created successfully.");
        } else {
            console.log("Found existing demo user:", user.username);
        }

        const userId = user._id;

        // 2. Clear old instances of these specific demo trips (cascading cleanup)
        const demoTripNames = ["Goa Beach Escape", "Kerala Nature Tour", "Japan Autumn Adventure"];
        for (const name of demoTripNames) {
            const oldTrip = await Trip.findOne({ userId, tripName: name });
            if (oldTrip) {
                console.log(`Cleaning old instance of: ${name}`);
                await Itinerary.deleteMany({ tripId: oldTrip._id });
                await Activity.deleteMany({ tripId: oldTrip._id });
                await Expense.deleteMany({ tripId: oldTrip._id });
                await Memory.deleteMany({ tripId: oldTrip._id });
                await Location.deleteMany({ tripId: oldTrip._id });
                await Trip.deleteOne({ _id: oldTrip._id });
            }
        }

        // ==========================================
        // TRIP 1: Goa Beach Escape (COMPLETED)
        // ==========================================
        console.log("\nSeeding Trip 1: Goa Beach Escape...");
        const trip1 = await Trip.create({
            userId,
            tripName: "Goa Beach Escape",
            startingPoint: "Hyderabad",
            destination: "Goa",
            startDate: new Date("2026-05-10"),
            endDate: new Date("2026-05-15"),
            budget: 35000,
            numberOfTravelers: 4
        });

        // Itinerary Day 1-6
        const itin1 = [
            { dayNumber: 1, place: "Panjim", activity: "Arrive in Goa, check in to hotel and relax", time: "14:00" },
            { dayNumber: 2, place: "Calangute Beach", activity: "Morning beach walk and water sports activity", time: "09:00" },
            { dayNumber: 3, place: "Fort Aguada", activity: "Explore historical fort and lighthouse", time: "15:00" },
            { dayNumber: 4, place: "Old Goa", activity: "Visit Basilica of Bom Jesus and Se Cathedral", time: "10:00" },
            { dayNumber: 5, place: "Baga Beach", activity: "Dinner at beach shack and nightlife exploration", time: "19:00" },
            { dayNumber: 6, place: "Panjim", activity: "Souvenir shopping and departure", time: "11:00" }
        ].map(item => ({ ...item, tripId: trip1._id, userId }));
        await Itinerary.insertMany(itin1);

        // Activities
        const act1 = [
            { activityName: "Beach walk", place: "Calangute Beach", date: new Date("2026-05-11"), time: "09:00" },
            { activityName: "Sightseeing", place: "Fort Aguada", date: new Date("2026-05-12"), time: "15:00" },
            { activityName: "Church Visit", place: "Old Goa", date: new Date("2026-05-13"), time: "10:00" },
            { activityName: "Shack Dinner", place: "Baga Beach", date: new Date("2026-05-14"), time: "19:00" }
        ].map(item => ({ ...item, tripId: trip1._id, userId }));
        await Activity.insertMany(act1);

        // Expenses (total = 28500)
        const exp1 = [
            { category: "Hotel", amount: 15000, date: new Date("2026-05-10"), description: "5 nights stay at beachfront resort" },
            { category: "Food", amount: 5500, date: new Date("2026-05-11"), description: "Meals at shacks and restaurants" },
            { category: "Taxi", amount: 3000, date: new Date("2026-05-10"), description: "Airport pickup and local transport" },
            { category: "Shopping", amount: 2000, date: new Date("2026-05-14"), description: "Souvenirs from Panjim market" },
            { category: "Water Sports", amount: 3000, date: new Date("2026-05-11"), description: "Parasailing and jet ski ride" }
        ].map(item => ({ ...item, tripId: trip1._id, userId }));
        await Expense.insertMany(exp1);

        // Memories
        const mem1 = [
            {
                mediaType: "Photo",
                mediaUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
                caption: "Breathtaking sunset at Calangute Beach",
                travelNote: "We spent the entire evening watching the waves crash and the sun sink below the horizon.",
                date: new Date("2026-05-11")
            },
            {
                mediaType: "Photo",
                mediaUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa",
                caption: "Historic Fort Aguada",
                travelNote: "Walking up to the lighthouse and seeing the sea view from the top was amazing.",
                date: new Date("2026-05-12")
            },
            {
                mediaType: "Photo",
                mediaUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220",
                caption: "Beautiful Baga Shack Dinner",
                travelNote: "Great seafood and amazing candlelit vibe by the beach.",
                date: new Date("2026-05-14")
            }
        ].map(item => ({ ...item, tripId: trip1._id, userId }));
        await Memory.insertMany(mem1);

        // Visited Locations
        const loc1 = [
            { placeName: "Calangute Beach", visitDate: new Date("2026-05-11"), visitTime: "09:00" },
            { placeName: "Fort Aguada", visitDate: new Date("2026-05-12"), visitTime: "15:00" },
            { placeName: "Old Goa", visitDate: new Date("2026-05-13"), visitTime: "10:00" },
            { placeName: "Baga Beach", visitDate: new Date("2026-05-14"), visitTime: "19:00" },
            { placeName: "Panjim", visitDate: new Date("2026-05-15"), visitTime: "11:00" }
        ].map(item => ({ ...item, tripId: trip1._id, userId }));
        await Location.insertMany(loc1);

        console.log("Trip 1 Seeded ✅");

        // ==========================================
        // TRIP 2: Kerala Nature Tour (ONGOING)
        // ==========================================
        console.log("\nSeeding Trip 2: Kerala Nature Tour...");
        const trip2 = await Trip.create({
            userId,
            tripName: "Kerala Nature Tour",
            startingPoint: "Hyderabad",
            destination: "Kerala",
            startDate: new Date("2026-06-26"),
            endDate: new Date("2026-06-30"),
            budget: 40000,
            numberOfTravelers: 3
        });

        // Itinerary Day 1-5 (Fully defined)
        const itin2 = [
            { dayNumber: 1, place: "Cochin", activity: "Arrive and explore Fort Kochi", time: "12:00" },
            { dayNumber: 2, place: "Alleppey", activity: "Board backwater houseboat cruise", time: "11:30" },
            { dayNumber: 3, place: "Munnar", activity: "Drive to Munnar and visit tea plantations", time: "10:00" },
            { dayNumber: 4, place: "Munnar", activity: "Trek to Eravikulam National Park", time: "08:30" },
            { dayNumber: 5, place: "Cochin", activity: "Departure and airport transfer", time: "15:00" }
        ].map(item => ({ ...item, tripId: trip2._id, userId }));
        await Itinerary.insertMany(itin2);

        // Completed Activities (Only June 26 & June 27)
        const act2 = [
            { activityName: "Fort Kochi walk", place: "Cochin", date: new Date("2026-06-26"), time: "15:00" },
            { activityName: "Houseboat boarding", place: "Alleppey", date: new Date("2026-06-27"), time: "11:30" }
        ].map(item => ({ ...item, tripId: trip2._id, userId }));
        await Activity.insertMany(act2);

        // Completed Expenses (Only June 26 & June 27)
        const exp2 = [
            { category: "Hotel", amount: 12000, date: new Date("2026-06-26"), description: "Houseboat stay and Kochi homestay" },
            { category: "Transport", amount: 4000, date: new Date("2026-06-26"), description: "Prepaid taxi from Kochi to Alleppey" },
            { category: "Food", amount: 2500, date: new Date("2026-06-27"), description: "Traditional Kerala meals" }
        ].map(item => ({ ...item, tripId: trip2._id, userId }));
        await Expense.insertMany(exp2);

        // Completed Memories (Only June 27 memory)
        const mem2 = [
            {
                mediaType: "Photo",
                mediaUrl: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2",
                caption: "Kerala Backwaters Houseboat",
                travelNote: "Boarded our houseboat today. Gliding through the calm backwaters lined with coconut trees.",
                date: new Date("2026-06-27")
            }
        ].map(item => ({ ...item, tripId: trip2._id, userId }));
        await Memory.insertMany(mem2);

        // Visited Locations (Only June 26 & June 27)
        const loc2 = [
            { placeName: "Cochin", visitDate: new Date("2026-06-26"), visitTime: "12:00" },
            { placeName: "Alleppey", visitDate: new Date("2026-06-27"), visitTime: "11:30" }
        ].map(item => ({ ...item, tripId: trip2._id, userId }));
        await Location.insertMany(loc2);

        console.log("Trip 2 Seeded ✅");

        // ==========================================
        // TRIP 3: Japan Autumn Adventure (UPCOMING)
        // ==========================================
        console.log("\nSeeding Trip 3: Japan Autumn Adventure...");
        const trip3 = await Trip.create({
            userId,
            tripName: "Japan Autumn Adventure",
            startingPoint: "Hyderabad",
            destination: "Tokyo, Japan",
            startDate: new Date("2026-10-10"),
            endDate: new Date("2026-10-18"),
            budget: 180000,
            numberOfTravelers: 2
        });

        // Basic Itinerary Day 1-9
        const itin3 = [
            { dayNumber: 1, place: "Tokyo", activity: "Flight arrival and check-in in Shinjuku", time: "17:00" },
            { dayNumber: 2, place: "Shibuya", activity: "Shibuya Crossing and Meiji Shrine visit", time: "10:00" },
            { dayNumber: 3, place: "Asakusa", activity: "Explore Senso-ji Temple and Nakamise Shopping Street", time: "09:30" },
            { dayNumber: 4, place: "Hakone", activity: "Day trip to Hakone for Mt. Fuji views and Onsen hot springs", time: "08:00" },
            { dayNumber: 5, place: "Kyoto", activity: "Shinkansen bullet train to Kyoto, visit Fushimi Inari Shrine", time: "11:00" },
            { dayNumber: 6, place: "Arashiyama", activity: "Walk through Arashiyama Bamboo Grove and monkey park", time: "09:00" },
            { dayNumber: 7, place: "Kyoto", activity: "Kinkaku-ji (Golden Pavilion) and traditional tea ceremony", time: "13:00" },
            { dayNumber: 8, place: "Tokyo", activity: "Return to Tokyo, Akihabara exploration", time: "15:00" },
            { dayNumber: 9, place: "Tokyo Narita", activity: "Departure flight home", time: "12:00" }
        ].map(item => ({ ...item, tripId: trip3._id, userId }));
        await Itinerary.insertMany(itin3);

        // Trip 3 requires NO activities, NO expenses, NO memories, NO visited locations.

        console.log("Trip 3 Seeded ✅");

        // -------------------------------------------------------------
        // Database Validation Checks
        // -------------------------------------------------------------
        console.log("\nRunning validation checks...");
        
        // Count confirmations
        const tripCount = await Trip.countDocuments({ userId });
        const itinCount = await Itinerary.countDocuments({ userId });
        const actCount = await Activity.countDocuments({ userId });
        const expCount = await Expense.countDocuments({ userId });
        const memCount = await Memory.countDocuments({ userId });
        const locCount = await Location.countDocuments({ userId });

        console.log(`Statistics: Trips: ${tripCount}, Itineraries: ${itinCount}, Activities: ${actCount}, Expenses: ${expCount}, Memories: ${memCount}, Locations: ${locCount}`);

        // Validate Trip budgets vs expenses
        for (const trip of [trip1, trip2, trip3]) {
            const expensesList = await Expense.find({ tripId: trip._id });
            const totalSpent = expensesList.reduce((sum, exp) => sum + exp.amount, 0);
            console.log(`Trip "${trip.tripName}": Budget = ₹${trip.budget}, Total Spent = ₹${totalSpent}`);
            if (totalSpent > trip.budget) {
                throw new Error(`Validation Failed: Spent amount ₹${totalSpent} exceeds budget ₹${trip.budget} on trip "${trip.tripName}"`);
            }
        }

        console.log("\nAll Database validations passed successfully!");
        
        console.log("\n================ SUMMARY ================");
        console.log("Completed Trip Generated ✅");
        console.log("Ongoing Trip Generated ✅");
        console.log("Planned Trip Generated ✅");
        console.log("Dashboard Updated ✅");
        console.log("Database Validation Passed ✅");
        console.log("=========================================\n");

        process.exit(0);
    } catch (err) {
        console.error("Seeding failed with error:", err.message);
        process.exit(1);
    }
}

seed();
