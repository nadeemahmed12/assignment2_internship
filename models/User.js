const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true  // Keep either this OR the schema.index(), not both
  },
  preferences: {
    categories: [String],
    priceRange: { min: Number, max: Number },
    distance: Number
  },
  location: String,
  notificationFrequency: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'off', null],
    default: 'hourly'
  },
  lastNotified: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Remove this if you're using unique:true above
// userSchema.index({ telegramId: 1 }, { unique: true });

// Keep these other indexes
userSchema.index({ location: 1 });
userSchema.index({ lastNotified: 1 });
userSchema.index({ 'preferences.categories': 1 });

module.exports = mongoose.model('User', userSchema);