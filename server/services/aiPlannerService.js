const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Service to generate AI Travel Plans based on Trip data.
 */
const generateTravelPlan = async (trip) => {
    try {
        if (!trip.startDate || !trip.endDate) {
            return "I'd love to generate a travel plan for you, but I need to know your travel dates first. What are your start and end dates?";
        }

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

Please include the EXACT following sections in your response, formatted beautifully using Markdown:
1. **Trip Summary**: A brief overview of the trip.
2. **Day-wise Itinerary**: A day-by-day breakdown of activities.
3. **Major Attractions**: Must-see places and top sights.
4. **Local Transportation**: Advice on getting around and estimated costs.
5. **Food Recommendations**: Where to eat based on the budget.
6. **Estimated Budget Allocation**: How to allocate the $${budget}.
7. **Weather Suggestions**: Expected weather and climate advice.
8. **Packing Recommendations**: What to bring.
9. **Local Travel Tips**: Local customs, etiquette, or safety tips.

ABSOLUTE RESTRICTIONS:
- Provide ONLY the travel plan in Markdown.
- NEVER generate: booked hotels, booked flights, reservation IDs, booking confirmations, airline ticket numbers, hotel names pretending they are reserved, fake prices presented as bookings, or statements like "I booked...". TravelSync is not a booking platform.
- INSTEAD use wording such as: "Suggested accommodation", "Recommended area to stay", "Estimated transportation cost", "Suggested attraction".
- Do NOT invent a user history.
- Do NOT generate HTML, only Markdown.
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
