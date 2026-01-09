const express = require('express');
const router = express.Router();
const Airport = require('../models/Airport');

// Get all airports
router.get('/', async (req, res) => {
  try {
    const airports = await Airport.find().sort({ city: 1 });
    res.json(airports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get airport by IATA code
router.get('/:code', async (req, res) => {
  try {
    const airport = await Airport.findOne({ code: req.params.code.toUpperCase() });
    if (!airport) {
      return res.status(404).json({ message: 'Airport not found' });
    }
    res.json(airport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 