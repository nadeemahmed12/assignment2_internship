const Event = require('../models/Event');
const User = require('../models/User');
const cron = require('node-cron');
const { scrapeEvents } = require('../utils/eventScraper');
const notificationService = require('../services/notificationServices');

// Scheduled job to check for new events and notify users
cron.schedule('0 */6 * * *', async () => {
    console.log('Running event check and notification...');
    try {
        // 1. Scrape new events
        const newEvents = await scrapeEvents();
        if (newEvents.length > 0) {
            await Event.insertMany(newEvents);
            console.log(`Added ${newEvents.length} new events`);

            // 2. Notify users about newly added events
            for (const event of newEvents) {
                await notificationService.notifyAboutSpecificEvent(event._id);
            }
        }

        // 3. Regular notification check
        await notificationService.checkAndNotifyUsers();
    } catch (error) {
        console.error('Event check error:', error);
    }
});

async function getEventsForUser(userId) {
    const user = await User.findOne({ telegramId: userId });
    if (!user || !user.location || !user.preferences?.categories) {
        return [];
    }

    return await Event.find({
        location: { $regex: new RegExp(user.location, 'i') },
        category: { $in: user.preferences.categories },
        date: { $gte: new Date() }
    })
    .sort({ date: 1 })
    .limit(10);
}

module.exports = { getEventsForUser };