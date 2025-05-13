const User = require('../models/User');
const Event = require('../models/Event');
const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

class NotificationService {
    constructor() {
        this.bot = bot;
    }

    /**
     * Send event notification to a specific user
     * @param {string} userId - Telegram user ID
     * @param {Array} events - Array of matching events
     */
    async sendUserNotification(userId, events) {
        try {
            if (!events || events.length === 0) return;

            const eventList = events.map(event =>
                `🎉 ${event.name}\n📅 ${event.date.toLocaleDateString()}\n📍 ${event.location}\n\n`
            ).join('');

            const message = `🚀 New events matching your preferences!\n\n${eventList}\nReply with 'more' to see additional options.`;

            await this.bot.telegram.sendMessage(userId, message, {
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });

            console.log(`Notification sent to user ${userId}`);
        } catch (error) {
            console.error(`Failed to notify user ${userId}:`, error.message);

            // Handle different types of errors
            if (error.response && error.response.error_code === 403) {
                // User blocked the bot or deleted account
                await User.findOneAndDelete({ telegramId: userId });
                console.log(`Removed inactive user ${userId}`);
            }
        }
    }

    /**
     * Check for and send notifications about new matching events
     */
    async checkAndNotifyUsers() {
        try {
            console.log('Running notification check...');

            // Get all active users with preferences
            const users = await User.find({
                'preferences.categories': { $exists: true, $ne: [] },
                location: { $exists: true, $ne: null }
            });

            // Get events from the last 24 hours
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);

            for (const user of users) {
                const matchingEvents = await Event.find({
                    location: { $regex: new RegExp(user.location, 'i') },
                    category: { $in: user.preferences.categories },
                    date: { $gte: new Date() }, // Future events
                    createdAt: { $gte: oneDayAgo } // Newly added events
                }).sort({ date: 1 }).limit(5); // Limit to 5 most relevant

                if (matchingEvents.length > 0) {
                    await this.sendUserNotification(user.telegramId, matchingEvents);

                    // Update last notified time
                    user.lastNotified = new Date();
                    await user.save();
                }
            }
        } catch (error) {
            console.error('Notification service error:', error);
        }
    }

    /**
     * Send immediate notification about a specific event
     * @param {string} eventId - MongoDB Event ID
     */
    async notifyAboutSpecificEvent(eventId) {
        try {
            const event = await Event.findById(eventId);
            if (!event) return;

            // Find users who might be interested
            const users = await User.find({
                'preferences.categories': event.category,
                location: { $regex: new RegExp(event.location, 'i') },
                $or: [
                    { lastNotified: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
                    { lastNotified: { $exists: false } }
                ]
            });

            for (const user of users) {
                await this.sendUserNotification(user.telegramId, [event]);

                // Update last notified time
                user.lastNotified = new Date();
                await user.save();
            }
        } catch (error) {
            console.error('Specific event notification error:', error);
        }
    }
}

// Export singleton instance
module.exports = new NotificationService();