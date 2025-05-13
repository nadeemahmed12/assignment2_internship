const { Telegraf } = require('telegraf');
const User = require('../models/User');
const { getLLMResponse } = require('../services/llmServices');
//const response = await getLLMResponse(preferences, location, message);
const notificationService = require('../services/notificationServices');
const { getEventsForUser } = require('./eventController');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Start command
bot.start(async (ctx) => {
  const userId = ctx.from.id.toString();

  // Check if user exists
  const user = await User.findOne({ telegramId: userId });

  if (!user) {
    await User.create({
      telegramId: userId,
      preferences: {}
    });
  }

  await ctx.reply(
    `Welcome to EventBot! 🎉\n\n` +
    `I can help you discover events in your area.\n\n` +
    `Tell me what kind of events you're interested in (music, sports, art, etc.) ` +
    `and your location to get started.\n\n` +
    `You can also use:\n` +
    `/notify - Check for events now\n` +
    `/notifications - Change notification settings`
  );
});

// Handle messages
bot.on('text', async (ctx) => {
  const userId = ctx.from.id.toString();
  const message = ctx.message.text;

  try {
    const user = await User.findOne({ telegramId: userId });
    if (!user) {
      return ctx.reply("Please start the bot with /start first");
    }

    const response = await getLLMResponse(
      user.preferences || {},
      user.location || 'unknown',
      message
    );

    await ctx.reply(response);

    // Update user preferences if mentioned
    if (message.toLowerCase().includes('i like') || message.toLowerCase().includes('i prefer')) {
      const categories = extractCategories(message);
      if (categories.length > 0) {
        user.preferences.categories = categories;
        await user.save();
      }
    }

    // Extract location if mentioned
    const location = extractLocation(message);
    if (location) {
      user.location = location;
      await user.save();

      // Send confirmation with notification info
      await ctx.reply(
        `Great! I've set your location to ${location}.\n\n` +
        `I'll notify you when interesting events happen there. ` +
        `You can also use /notify to check now or /notifications to change settings.`
      );
    }

  } catch (error) {
    console.error('Bot error:', error);
    await ctx.reply("Sorry, I encountered an error processing your request.");
  }
});

// Command to manually trigger notifications
bot.command('notify', async (ctx) => {
    const userId = ctx.from.id.toString();

    try {
        const user = await User.findOne({ telegramId: userId });
        if (!user) {
            return ctx.reply("Please start the bot with /start first");
        }

        if (!user.location || !user.preferences?.categories) {
            return ctx.reply("Please set your location and preferences first");
        }

        await ctx.reply("Checking for new events...");

        // Manually trigger notification check for this user
        const events = await getEventsForUser(userId);
        if (events.length > 0) {
            await notificationService.sendUserNotification(userId, events);
        } else {
            await ctx.reply("No new events matching your preferences found.");
        }
    } catch (error) {
        console.error('Notify command error:', error);
        await ctx.reply("Sorry, I encountered an error checking for events.");
    }
});

// Command to manage notification preferences
bot.command('notifications', async (ctx) => {
    const userId = ctx.from.id.toString();

    try {
        const user = await User.findOne({ telegramId: userId });
        if (!user) {
            return ctx.reply("Please start the bot with /start first");
        }

        await ctx.reply(
            `🔔 Notification Settings:\n\n` +
            `Current frequency: Every 6 hours\n` +
            `To change settings, reply with:\n` +
            `- "daily" for once per day\n` +
            `- "weekly" for once per week\n` +
            `- "off" to disable notifications\n\n` +
            `You can always request events manually with /notify`
        );

        // Wait for user response
        bot.hears(['daily', 'weekly', 'off'], async (ctx) => {
            const choice = ctx.message.text.toLowerCase();
            user.notificationFrequency = choice === 'off' ? null : choice;
            await user.save();

            await ctx.reply(
                `Notification settings updated! ` +
                `You'll ${choice === 'off' ? 'not receive' : 'receive'} ` +
                `${choice === 'off' ? 'automatic notifications' : choice + ' notifications'}.`
            );
        });

    } catch (error) {
        console.error('Notifications command error:', error);
        await ctx.reply("Sorry, I encountered an error accessing your settings.");
    }
});

// Helper functions
function extractCategories(text) {
  const categories = ['music', 'sports', 'art', 'theater', 'food', 'comedy', 'technology'];
  return categories.filter(cat => text.toLowerCase().includes(cat));
}

function extractLocation(text) {
  // Simple implementation - would use NLP in production
  const locations = ['new york', 'london', 'paris', 'berlin', 'tokyo'];
  const found = locations.find(loc => text.toLowerCase().includes(loc));
  return found || null;
}

module.exports = bot;