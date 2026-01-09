const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');

// Search flights
router.get('/search', async (req, res) => {
  try {
    const { origin, destination, date } = req.query;
    
    // Create date range for the search date
    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const flights = await Flight.find({
      'origin.code': origin.toUpperCase(),
      'destination.code': destination.toUpperCase(),
      departureTime: {
        $gte: searchDate,
        $lt: nextDay
      }
    }).sort({ departureTime: 1 });

    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all flights
router.get('/', async (req, res) => {
  try {
    const flights = await Flight.find().sort({ departureTime: 1 });
    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get flight by ID
router.get('/:id', async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.json(flight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 