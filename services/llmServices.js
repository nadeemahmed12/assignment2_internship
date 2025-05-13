// services/llmServices.js - Complete local solution
require('dotenv').config();

// Comprehensive local response database
const LOCAL_RESPONSES = {
  music: [
    "Check Ticketmaster for concerts in {location} this weekend",
    "Local music venues in {location} often have live performances on Fridays",
    "I found some jazz clubs in {location} that might interest you",
    "The {location} symphony has performances scheduled next month"
  ],
  sports: [
    "The {location} stadium has games scheduled next week",
    "Local sports bars in {location} often show major games",
    "Check the {location} city website for sports events",
    "There's a local soccer tournament in {location} this weekend"
  ],
  art: [
    "There's an art exhibition in {location} opening next week",
    "Local galleries in {location} have new shows this month",
    "The {location} museum has special events on weekends",
    "An international art fair is coming to {location} next season"
  ],
  food: [
    "The {location} food festival happens next month",
    "Local restaurants are hosting wine tasting events in {location}",
    "There's a farmers market in {location} every Saturday",
    "A new culinary workshop is starting in {location} next week"
  ],
  general: [
    "Eventbrite has several activities listed for {location}",
    "Meetup.com has local events in {location} matching your interests",
    "Check {location}'s tourism website for upcoming events",
    "Local community centers in {location} often host interesting events"
  ]
};

class LocalEventRecommender {
  constructor() {
  }

  getRandomResponse(category) {
    const responses = LOCAL_RESPONSES[category] || LOCAL_RESPONSES.general;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  formatResponse(response, preferences, location) {
    return response
      .replace('{location}', location || 'your area')
      .replace('{preferences}', preferences?.categories?.join(', ') || 'interesting');
  }

  async getLLMResponse(preferences, location, message) {
    try {
      // Determine main category from preferences
      const mainCategory = preferences?.categories?.[0] || 'general';

      // Get random response for the category
      const response = this.getRandomResponse(mainCategory);

      // Format the response with location and preferences
      return this.formatResponse(response, preferences, location);

    } catch (error) {
      console.error('Local recommendation error:', error);
      return "I can suggest checking local event listings in " + (location || "your area");
    }
  }
}

// Initialize the service
const recommender = new LocalEventRecommender();

module.exports = {
  getLLMResponse: (preferences, location, message) =>
    recommender.getLLMResponse(preferences, location, message)
};