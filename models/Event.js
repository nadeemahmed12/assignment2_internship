const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  category: String,
  date: Date,
  price: Number,
  source: String,
  sourceId: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);