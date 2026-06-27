const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Service to generate AI Travel Plans based on Trip data.
 */
const generateTravelPlan = async (trip) => {
    try {
        const destination = trip.destination;
        const startDate = new Date(trip.startDate).toLocaleDateString();
        const endDate = new Date(trip.endDate).toLocaleDateString();
        const budget = trip.budget;
        const travelers = trip.numberOfTravelers;
        const startingPoint = trip.startingPoint || 'your starting point';

        const systemPrompt = `You are an expert AI Travel Planner.
Your task is to generate a comprehensive, highly detailed travel plan based on the following trip details:
- Destination: ${destination}
- Starting Point: ${startingPoint}
- Dates: ${startDate} to ${endDate}
- Budget: $${budget}
- Travelers: ${travelers}

Please include the following sections in your response, formatted beautifully using Markdown:
1. **Day-wise Itinerary**: A day-by-day breakdown of activities.
2. **Attractions**: Must-see places and top sights.
3. **Restaurants**: Where to eat based on the budget.
4. **Local Transportation**: Advice on getting around.
5. **Budget Breakdown**: How to allocate the $${budget}.
6. **Weather Tips**: Expected weather and climate advice.
7. **Packing Suggestions**: What to bring.
8. **Travel Recommendations**: Local customs, etiquette, or safety tips.

IMPORTANT RULES:
- Provide ONLY the travel plan in Markdown.
- DO NOT include hotel bookings, flight bookings, reservation IDs, airline names, hotel names, or any fake booking confirmations. TravelSync is not a booking platform.
- At the very end of your response, explicitly ask the user: "Would you like me to save these activities or itinerary suggestions to your planner?"
- DO NOT invent a user history or say things like "As I mentioned earlier".
- Keep the tone professional, inspiring, and helpful.`;

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Please generate my AI travel plan for ${destination}.` }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
        });

        return chatCompletion.choices[0]?.message?.content || "Sorry, I could not generate the travel plan at this time.";
    } catch (error) {
        console.error("AI Planner Service Error:", error);
        return "I'm having trouble connecting to my travel knowledge base right now. Please try again later.";
    }
};

module.exports = {
    generateTravelPlan
};
