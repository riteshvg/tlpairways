require('dotenv').config();
const mongoose = require('mongoose');
const Airport = require('../models/Airport');
const airportsData = require('../../../data/airports.json');
const connectDB = require('../config/database');

const seedAirports = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Clear existing airports
    await Airport.deleteMany({});
    console.log('Cleared existing airports');

    // Transform the data to match our schema
    const airports = airportsData.map(airport => ({
      code: airport.iata_code,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      timezone: 'UTC' // Default timezone, can be updated later
    }));

    // Insert the airports
    await Airport.insertMany(airports);
    console.log('Successfully seeded airports');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding airports:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedAirports(); 