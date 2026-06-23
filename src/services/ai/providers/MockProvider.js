import { determineIntent } from '../promptManager';

/**
 * MockProvider
 * 
 * Why does this exist?
 * To decouple our frontend from a specific AI provider (like OpenAI or Gemini), we use the Strategy Pattern.
 * This MockProvider acts exactly like a real AI provider but returns hardcoded, realistic responses.
 * When we are ready to integrate Gemini, we just create a `GeminiProvider` that implements the same `generate` method.
 */

class MockProvider {
  /**
   * Simulates a network request to an AI service
   * @param {string} prompt - The user's message
   * @param {Array} history - The conversation history
   * @param {string} systemPrompt - The rules for the AI
   */
  async generate(prompt, history, systemPrompt) {
    // Simulate network delay between 1.5s and 3s for realism
    const delay = Math.floor(Math.random() * 1500) + 1500;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const intent = determineIntent(prompt);
        let response = '';

        // Generate a realistic response based on the detected intent
        switch (intent) {
          case 'planning':
            response = this.getPlanningResponse(prompt);
            break;
          case 'budget':
            response = this.getBudgetResponse(prompt);
            break;
          case 'packing':
            response = this.getPackingResponse(prompt);
            break;
          case 'recommendation':
            response = this.getRecommendationResponse(prompt);
            break;
          case 'greeting':
            response = "Hello! I'm your TravelSync AI Assistant. How can I help you plan your next adventure today? I can help with itineraries, budgets, packing lists, and recommendations!";
            break;
          case 'unrelated':
            response = "I'd love to chat about that, but my expertise is currently focused on **travel planning**. I can help you build an itinerary, estimate trip costs, or suggest great places to visit. Where would you like to travel next?";
            break;
          default:
            response = "That sounds exciting! Travel is all about exploring new perspectives. Could you provide a bit more detail about your destination or what kind of trip you're looking for so I can give you the best advice?";
        }

        resolve(response);
      }, delay);
    });
  }

  // --- Mock Response Generators (using Markdown for rich formatting) ---

  getPlanningResponse(prompt) {
    const destination = this.extractDestination(prompt) || 'Goa';
    return `Here is a suggested **3-Day Itinerary** for ${destination}:

### Day 1: Arrival & Exploration
* **Morning:** Arrive, check into your hotel, and grab a local breakfast.
* **Afternoon:** Visit the most famous landmark in the area. Take plenty of photos!
* **Evening:** Enjoy a welcome dinner at a highly-rated local restaurant.

### Day 2: Adventure & Culture
* **Morning:** Take a guided tour or hike to experience the natural beauty.
* **Afternoon:** Visit a museum or cultural center to learn about the history.
* **Evening:** Explore the local nightlife or night markets.

### Day 3: Relaxation & Departure
* **Morning:** Enjoy a relaxed morning by the beach, lake, or cafe.
* **Afternoon:** Souvenir shopping and a light lunch.
* **Evening:** Depart with wonderful memories!

*Would you like me to adjust this to a different number of days?*`;
  }

  getBudgetResponse(prompt) {
    const destination = this.extractDestination(prompt) || 'your destination';
    return `Here is an estimated **Budget Breakdown** for a mid-range trip to ${destination}:

| Category | Estimated Daily Cost (USD) | Notes |
| :--- | :--- | :--- |
| **Accommodation** | $60 - $120 | 3-star hotel or nice Airbnb |
| **Food & Dining** | $30 - $60 | Mix of local cafes and nice dinners |
| **Transportation** | $15 - $30 | Public transit and occasional cabs |
| **Activities** | $20 - $50 | Entry fees and guided tours |
| **Total** | **$125 - $260 / day** | *Excludes flights* |

*Pro Tip: Traveling during the shoulder season can reduce these costs by up to 30%!*`;
  }

  getPackingResponse(prompt) {
    const destination = this.extractDestination(prompt) || 'your trip';
    return `Here is a comprehensive **Packing Checklist** for ${destination}:

**Essentials:**
* [ ] Passport / ID
* [ ] Tickets & Boarding Passes
* [ ] Travel Insurance Documents
* [ ] Medications

**Clothing (Adjust for weather):**
* [ ] Comfortable walking shoes
* [ ] 4-5 lightweight tops
* [ ] 2-3 pairs of pants/shorts
* [ ] Light jacket or sweater
* [ ] Swimwear (if applicable)

**Electronics:**
* [ ] Smartphone & Charger
* [ ] Universal Power Adapter
* [ ] Power Bank

*Need help packing for a specific climate (e.g., snowy, tropical)? Let me know!*`;
  }

  getRecommendationResponse(prompt) {
    const destination = this.extractDestination(prompt) || 'Hyderabad';
    return `Here are the **Top Attractions** you absolutely must visit in ${destination}:

1. **The Historic Center:** Wander through the old streets and soak in the architecture.
2. **The Grand Museum:** A perfect place to understand the local culture and history.
3. **Local Food Market:** The best way to experience a culture is through its street food!
4. **The Botanical Gardens:** A serene escape from the city hustle.
5. **Panoramic Viewpoint:** Don't miss the sunset from the highest point in the city.

*Which of these sounds the most interesting to you?*`;
  }

  /**
   * Simple helper to try and extract a capitalized word that might be a destination
   */
  extractDestination(prompt) {
    const words = prompt.split(' ');
    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[.,?!]/g, '');
      // Look for a capitalized word that isn't at the very start of a sentence
      if (word.length > 2 && word[0] === word[0].toUpperCase() && i > 0) {
        return word;
      }
    }
    return null;
  }
}

export default MockProvider;
