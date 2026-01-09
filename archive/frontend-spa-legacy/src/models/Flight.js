const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: true,
    unique: true
  },
  origin: {
    code: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3
    },
    name: {
      type: String,
      required: true
    }
  },
  destination: {
    code: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3
    },
    name: {
      type: String,
      required: true
    }
  },
  departureTime: {
    type: Date,
    required: true
  },
  arrivalTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'DELAYED', 'CANCELLED', 'COMPLETED'],
    default: 'SCHEDULED'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Flight', flightSchema); 