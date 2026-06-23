require('dotenv').config();
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const hasPendingWorkflow = false;

const systemPrompt = `You are an Intent Classifier. Currently, hasPendingWorkflow = ${hasPendingWorkflow}.
Classify the user's input into EXACTLY ONE of these categories:
- GREETING (hi, hello, good morning)
- CREATE_TRIP (create a trip, add trip)
- READ_TRIPS (show my trips, list my trips, show my saved trips, show my travel history, can you show my travel history, what trips do I have, what trips have I planned, where am I travelling, where have I travelled, what destinations do I have saved, show my vacations, list my vacations, show my journeys, what is my travel history, what places am I visiting, what trips are in my account)
- UPDATE_TRIP (change budget, update trip)
- DELETE_TRIP (delete trip, remove trip)
- CANCEL_WORKFLOW (cancel, stop, abort)
- TRAVEL_QUESTION (tell me about goa, best time to visit)
- GENERAL_CHAT (thank you, awesome, tell me a joke)
- START_NEW_WORKFLOW (If hasPendingWorkflow is true and the user tries to initiate a NEW CRUD operation completely different from the current one)
- CONTINUE_WORKFLOW (The user is answering a form question, e.g. "Hyderabad", "15000", "2026-07-10", "4", "yes", "no")
- UNKNOWN

You MUST output ONLY a JSON object: { "intent": "INTENT_NAME" }. No explanations.`;

const testPrompts = [
    "What are those?",
    "Show them to me",
    "List them"
];

async function runTests() {
    for (const prompt of testPrompts) {
        try {
            const res = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Input: "${prompt}"` }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0,
                response_format: { type: 'json_object' }
            });
            console.log(`Prompt: "${prompt}" =>`, res.choices[0].message.content.trim());
        } catch (e) {
            console.error("Error:", e.message);
        }
    }
}

runTests();
