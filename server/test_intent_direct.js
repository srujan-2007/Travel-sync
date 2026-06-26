require('dotenv').config();
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function classifyIntent(prompt, hasPendingWorkflow) {
    const systemPrompt = `
You are an Intent Classifier for a Travel Management AI system.

Your job is ONLY to classify user input into ONE intent.
You MUST be extremely stable, conservative, and avoid misclassification.

CURRENT STATE:
hasPendingWorkflow = ${hasPendingWorkflow}

========================
INTENT CATEGORIES
========================

1. GREETING
User is greeting or casual opening.
Examples: hi, hello, hey, good morning, how are you

2. CREATE_TRIP
User explicitly wants to create or start planning a trip.
Examples: create trip, plan a trip, add trip

3. READ_TRIPS
User wants to view or analyze trips.
Examples:
show my trips, list my trips, travel history, what trips do I have,
what are my trips, show my vacations, show my journeys

4. UPDATE_TRIP
User explicitly wants to modify a trip.
Examples: update trip, change budget, modify trip, edit trip

5. DELETE_TRIP
User explicitly wants to delete a trip.
Examples: delete trip, remove trip

6. CANCEL_WORKFLOW
User explicitly wants to stop or cancel current operation.
Examples: cancel, stop, abort

7. TRAVEL_QUESTION
General travel knowledge questions.
Examples: best places in goa, when to visit japan, information about paris

8. GENERAL_CHAT
Non-task conversational messages.
Examples: tell me a joke, thank you, ok, nice, cool

9. START_NEW_WORKFLOW
ONLY when:
- hasPendingWorkflow = true
AND
- user clearly tries to start a NEW operation using verbs like create/add/plan/update/delete
AND
- it is NOT part of answering a form step

10. CONTINUE_WORKFLOW (VERY IMPORTANT RULE)
This is the MOST IMPORTANT CLASS.

If hasPendingWorkflow = true, classify as CONTINUE_WORKFLOW when:

- The user input is a NORMAL field value for a form step
Examples:
  "Goa Beach Escape"
  "Hyderabad"
  "15000"
  "2026-10-10"
  "2"

CRITICAL RULES:
- NEVER treat normal names, cities, numbers, or dates as commands
- NEVER look for meaning in these values
- DO NOT classify them as GREETING, TRAVEL_QUESTION, or GENERAL_CHAT
- DO NOT assume intent from meaning when workflow is active

ONLY classify as CONTINUE_WORKFLOW when:
- It is answering a question in a workflow
- AND it does NOT contain command words like:
  create, update, delete, remove, show, list, cancel, abort, stop

11. UNKNOWN
Only when input cannot be understood at all

========================
HARD RULES
========================

- Output ONLY valid JSON:
  { "intent": "INTENT_NAME" }

- NO explanations
- NO extra text
- NO reasoning output
- NEVER overthink user input during workflows
- NEVER block valid field inputs
- NEVER treat normal text as commands inside workflow

========================
EXAMPLES (VERY IMPORTANT)
========================

User: "explore hyderabad"
→ CONTINUE_WORKFLOW (if workflow active)

User: "Goa Beach Escape"
→ CONTINUE_WORKFLOW

User: "15000"
→ CONTINUE_WORKFLOW

User: "hi"
→ GREETING

User: "tell me a joke"
→ GENERAL_CHAT

User: "create trip"
→ CREATE_TRIP

User: "what is best time to visit goa"
→ TRAVEL_QUESTION
`;

    try {
        const res = await groq.chat.completions.create({
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0,
            response_format: { type: 'json_object' }
        });
        const parsed = JSON.parse(res.choices[0].message.content.trim());
        return parsed.intent || 'UNKNOWN';
    } catch (e) {
        console.error("ERROR", e);
        return 'ERROR';
    }
}

async function run() {
    console.log("hasPendingWorkflow = false, 'Create trip' ->", await classifyIntent("Create trip", false));
    console.log("hasPendingWorkflow = true, 'Hi' ->", await classifyIntent("Hi", true));
    console.log("hasPendingWorkflow = true, 'What is the capital of France?' ->", await classifyIntent("What is the capital of France?", true));
}

run();
