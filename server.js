require('dotenv').config();
const express = require('express');
const notificationService = require('./services/notificationServices');
const connectDB = require('./config/db');
const bot = require('./controllers/botController');
require('./controllers/eventController');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Start Telegram bot
bot.launch()
  .then(() => console.log('Telegram bot started'))
  .catch(err => console.error('Bot start error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('Event Recommendation Bot API');
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));