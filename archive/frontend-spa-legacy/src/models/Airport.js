const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    minlength: 3,
    maxlength: 3
  },
  name: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  timezone: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Airport', airportSchema); 