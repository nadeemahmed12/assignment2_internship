const axios = require('axios');
const Event = require('../models/Event');

async function scrapeEvents() {
  try {
    // Example: Ticketmaster API
    const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
      params: {
        apikey: '7407277681:AAGn1vw6XAaRM3Jy_cskr8u2TkdBL5T3TYA',
        size: 50,
        classificationName: 'music,comedy,sports'
      }
    });

    const events = response.data._embedded?.events || [];

    return events.map(event => ({
      name: event.name,
      description: event.info || '',
      location: event._embedded?.venues?.[0]?.city?.name || 'Unknown',
      coordinates: {
        lat: event._embedded?.venues?.[0]?.location?.latitude,
        lng: event._embedded?.venues?.[0]?.location?.longitude
      },
      category: event.classifications?.[0]?.segment?.name || 'Other',
      date: new Date(event.dates.start.dateTime),
      price: event.priceRanges?.[0]?.min || 0,
      source: 'Ticketmaster',
      sourceId: event.id
    }));

  } catch (error) {
    console.error('Scraping error:', error);
    return [];
  }
}

module.exports = { scrapeEvents };