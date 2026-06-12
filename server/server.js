const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/trips', require('./routes/tripRoutes'));
app.use('/api/itineraries', require('./routes/itineraryRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/memories', require('./routes/memoryRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});