const Groq = require('groq-sdk');
const Trip = require('../models/Trip');
const PendingAction = require('../models/PendingAction');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const fieldsOrder = [
    { key: 'destination', question: 'What is the destination?' },
    { key: 'tripName', question: 'What should be the trip name?' },
    { key: 'startingPoint', question: 'What is the starting point?' },
    { key: 'startDate', question: 'What is the start date? (YYYY-MM-DD)' },
    { key: 'endDate', question: 'What is the end date? (YYYY-MM-DD)' },
    { key: 'budget', question: 'What is the budget? (number only)' },
    { key: 'numberOfTravelers', question: 'How many travelers? (number only)' }
];

// Helper to format destination strings correctly
const formatDest = (dest) => dest.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

async function classifyIntent(prompt, hasPendingWorkflow) {
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
- START_NEW_WORKFLOW (If hasPendingWorkflow is true and the user explicitly uses words like 'create', 'add', or 'plan' to start a completely new operation)
- CONTINUE_WORKFLOW (The user is answering a form question. CRITICAL: If hasPendingWorkflow is true, ANY short phrase, name, location, or number (e.g., "Goa Beach Escape", "Hyderabad", "15000") that does NOT contain command verbs like "create", "update", "delete", "remove", "show", or "list" MUST be classified as CONTINUE_WORKFLOW)
- UNKNOWN

You MUST output ONLY a JSON object: { "intent": "INTENT_NAME" }. No explanations.
Input: "${prompt}"`;

    try {
        const res = await groq.chat.completions.create({
            messages: [{ role: 'system', content: systemPrompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0,
            response_format: { type: 'json_object' }
        });
        const parsed = JSON.parse(res.choices[0].message.content.trim());
        return parsed.intent || 'UNKNOWN';
    } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
            console.error("\n=== INTENT CLASSIFICATION ERROR ===");
            console.error(e.message || e);
            console.error("Initiating deterministic fallback rules...");
            console.error("===================================\n");
        }
        
        // Deterministic Fallback Rules for API Outages
        const p = prompt.toLowerCase();
        const readTripsRegexes = [
            /\b(?:show|list)\b.*\btrips?\b/i,
            /\btravel history\b/i,
            /\b(?:what|which)\b.*\btrips?\b/i,
            /\bhow many trips\b/i,
            /\btrip names?\b/i,
            /\btrip titles?\b/i,
            /\b(?:highest|cheapest|latest|most expensive)\b.*\btrip\b/i,
            /\bdo i have any\b.*\btrips?\b/i,
            /\bwhere (?:am i|have i)\b/i
        ];

        if (/\b(cancel|abort|stop)\b/i.test(p)) return 'CANCEL_WORKFLOW';
        if (/\b(?:create|plan|add|new)\b/i.test(p)) return 'CREATE_TRIP';
        if (/\b(?:update|change|modify|edit)\b/i.test(p)) return 'UPDATE_TRIP';
        if (/\b(?:delete|remove)\b/i.test(p)) return 'DELETE_TRIP';
        if (readTripsRegexes.some(r => r.test(p))) return 'READ_TRIPS';
        
        const isChatOrQuestion = /\b(?:hi|hello|hey|joke|weather|how are you|what can you do|thank you|thanks|help|tell me|who are you|capital)\b/i.test(p) || /\?$/.test(p.trim());
        if (isChatOrQuestion) {
            return 'GENERAL_CHAT';
        }
        
        if (hasPendingWorkflow) {
            const isCommand = /\b(?:create|plan|update|change|modify|delete|remove|show|list)\b/i.test(p);
            if (!isCommand) return 'CONTINUE_WORKFLOW';
        }
        
        return 'UNKNOWN';
    }
}

const generateChatResponse = async (req, res, next) => {
    try {
        const { prompt, history, systemPrompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "Prompt is required" });

        const userId = req.user.id;
        let pendingAction = await PendingAction.findOne({ userId });
        
        // Treat CONTEXT as not pending a CRUD workflow, so it doesn't block new ones
        const hasPendingCRUD = pendingAction && pendingAction.action !== 'CONTEXT';
        
        const simulateOutage = req.headers['x-simulate-outage'] === 'true';
        let intent;
        if (simulateOutage) {
            const p = prompt.toLowerCase();
            const readTripsRegexes = [
                /\b(?:show|list)\b.*\btrips?\b/i,
                /\btravel history\b/i,
                /\b(?:what|which)\b.*\btrips?\b/i,
                /\bhow many trips\b/i,
                /\btrip names?\b/i,
                /\btrip titles?\b/i,
                /\b(?:highest|cheapest|latest|most expensive)\b.*\btrip\b/i,
                /\bdo i have any\b.*\btrips?\b/i,
                /\bwhere (?:am i|have i)\b/i
            ];

            if (/\b(cancel|abort|stop)\b/i.test(p)) intent = 'CANCEL_WORKFLOW';
            else if (/\b(?:create|plan|add|new)\b/i.test(p)) intent = 'CREATE_TRIP';
            else if (/\b(?:update|change|modify|edit)\b/i.test(p)) intent = 'UPDATE_TRIP';
            else if (/\b(?:delete|remove)\b/i.test(p)) intent = 'DELETE_TRIP';
            else if (readTripsRegexes.some(r => r.test(p))) intent = 'READ_TRIPS';
            else {
                const isChatOrQuestion = /\b(?:hi|hello|hey|joke|weather|how are you|what can you do|thank you|thanks|help|tell me|who are you|capital)\b/i.test(p) || /\?$/.test(p.trim());
                if (isChatOrQuestion) intent = 'GENERAL_CHAT';
                else if (hasPendingCRUD) {
                    const isCommand = /\b(?:create|plan|update|change|modify|delete|remove|show|list)\b/i.test(p);
                    intent = !isCommand ? 'CONTINUE_WORKFLOW' : 'UNKNOWN';
                } else {
                    intent = 'UNKNOWN';
                }
            }
            console.log(`[OUTAGE SIMULATION] Fallback Intent: ${intent}`);
        } else {
            intent = await classifyIntent(prompt, hasPendingCRUD);
        }
        
        console.log(`\n=== INTENT ROUTER DEBUG ===`);
        console.log(`Original Prompt: "${prompt}"`);
        console.log(`Detected Intent: ${intent}`);
        console.log(`Router Decision: Executing ${intent} workflow logic...`);
        console.log(`===========================\n`);

        // 1. CANCEL WORKFLOW
        if (intent === 'CANCEL_WORKFLOW') {
            if (pendingAction) {
                await PendingAction.deleteMany({ userId });
                return res.status(200).json({ response: "Action cancelled. How else can I help you?" });
            } else {
                return res.status(200).json({ response: "There is no active action to cancel." });
            }
        }

        // 2. ACTIVE PENDING ACTION (Context-Aware Routing)
        if (hasPendingCRUD) {
            if (['START_NEW_WORKFLOW', 'CREATE_TRIP', 'UPDATE_TRIP', 'DELETE_TRIP', 'READ_TRIPS', 'GREETING', 'GENERAL_CHAT', 'TRAVEL_QUESTION'].includes(intent)) {
                return res.status(200).json({ response: `You already have a ${pendingAction.action} trip workflow in progress.\n\nWould you like to:\n1. Continue current workflow\n2. Cancel it and start a new operation (Reply 'cancel')` });
            }

            // Fallthrough for CONTINUE_WORKFLOW or UNKNOWN (Treat as input to State Machine)
            
            // --- CREATE WORKFLOW ---
            if (pendingAction.action === 'CREATE') {
                const data = pendingAction.get('data') || {};
                let promptProcessed = false;

                if (pendingAction.step === 'CONFIRMING') {
                    const editMatch = prompt.match(/\bchange\s+(.+?)\s+to\s+(.+)\b/i);
                    if (editMatch) {
                        const fieldRaw = editMatch[1].trim().toLowerCase();
                        const newVal = editMatch[2].trim();
                        if (fieldRaw.includes('budget')) data.budget = newVal;
                        else if (fieldRaw.includes('traveler')) data.numberOfTravelers = newVal;
                        else if (fieldRaw.includes('start date')) data.startDate = newVal;
                        else if (fieldRaw.includes('end date')) data.endDate = newVal;
                        else if (fieldRaw.includes('starting point')) data.startingPoint = newVal;
                        else if (fieldRaw.includes('trip name') || fieldRaw.includes('name')) data.tripName = newVal;
                        else if (fieldRaw.includes('destination')) data.destination = newVal;
                        
                        pendingAction.step = 'COLLECTING'; 
                        promptProcessed = true;
                    } else if (/\b(yes|sure|ok|confirm|create)\b/i.test(prompt)) {
                        const newTrip = await Trip.create({
                            userId,
                            tripName: data.tripName,
                            destination: formatDest(data.destination),
                            startingPoint: data.startingPoint,
                            startDate: new Date(data.startDate),
                            endDate: new Date(data.endDate),
                            budget: Number(data.budget),
                            numberOfTravelers: Number(data.numberOfTravelers)
                        });
                        await PendingAction.findByIdAndDelete(pendingAction._id);
                        return res.status(200).json({ response: `Success! Trip '${newTrip.tripName}' has been created.` });
                    } else if (/\b(no)\b/i.test(prompt)) {
                        await PendingAction.findByIdAndDelete(pendingAction._id);
                        return res.status(200).json({ response: "Trip creation cancelled." });
                    }
                }

                if (pendingAction.step === 'COLLECTING' && !promptProcessed) {
                    const missingIndex = fieldsOrder.findIndex(f => !data[f.key] || data[f.key] === '__INVALID__');
                    if (missingIndex !== -1) {
                        const currentField = fieldsOrder[missingIndex].key;
                        
                        console.log(`\n=== COMMAND DETECTION LAYER ===`);
                        console.log(`Current Expected Field: ${currentField}`);
                        console.log(`User Input: "${prompt}"`);
                        console.log(`Detected Intent: ${intent}`);
                        
                        const isCommandOverride = /\b(?:create|plan|update|change|modify|delete|remove|show|list)\b/i.test(prompt);
                        
                        if (isCommandOverride || !['CONTINUE_WORKFLOW', 'UNKNOWN'].includes(intent)) {
                            console.log(`Value Written?: NO`);
                            console.log(`Reason: Input identified as a system command override.`);
                            console.log(`===============================\n`);
                            return res.status(200).json({ response: `You already have a ${pendingAction.action} trip workflow in progress.\n\nWould you like to:\n1. Continue current workflow\n2. Cancel it and start a new operation (Reply 'cancel')` });
                        } else {
                            let rawVal = prompt.trim();
                            const lowerVal = rawVal.toLowerCase();
                            
                            const blockedValues = ['continue', 'yes', 'no', 'cancel', 'confirm'];
                            if (blockedValues.includes(lowerVal)) {
                                return res.status(200).json({ response: `"${rawVal}" is a reserved system keyword. Please provide a valid value for the ${currentField === 'tripName' ? 'trip name' : currentField}.` });
                            }
                            
                            if (currentField === 'startDate' || currentField === 'endDate') {
                                const dateVal = new Date(rawVal);
                                if (isNaN(dateVal.getTime())) {
                                    return res.status(200).json({ response: "Please provide a valid date in YYYY-MM-DD format." });
                                }
                                if (currentField === 'endDate' && data.startDate && data.startDate !== '__INVALID__') {
                                    if (dateVal < new Date(data.startDate)) {
                                        return res.status(200).json({ response: "End date cannot be before start date. Please provide a valid end date." });
                                    }
                                }
                            }
                            if (currentField === 'budget') {
                                const val = parseFloat(rawVal);
                                if (isNaN(val) || val < 0) {
                                    return res.status(200).json({ response: "Please provide a valid positive number for budget." });
                                }
                                rawVal = val;
                            }
                            if (currentField === 'numberOfTravelers') {
                                const val = parseInt(rawVal);
                                if (isNaN(val) || val <= 0) {
                                    return res.status(200).json({ response: "Please provide a valid number of travelers (must be at least 1)." });
                                }
                                rawVal = val;
                            }
                            
                            data[currentField] = rawVal;
                            console.log(`Value Written?: YES`);
                            console.log(`Reason: Valid field input.`);
                            console.log(`===============================\n`);
                        }
                    }
                }

                const nextMissingIndex = fieldsOrder.findIndex(f => !data[f.key] || data[f.key] === '__INVALID__');
                if (nextMissingIndex !== -1) {
                    pendingAction.data = data;
                    pendingAction.step = 'COLLECTING';
                    pendingAction.markModified('data');
                    await pendingAction.save();
                    return res.status(200).json({ response: fieldsOrder[nextMissingIndex].question });
                }

                const sDate = new Date(data.startDate);
                const eDate = new Date(data.endDate);
                const budget = Number(data.budget);
                const travelers = Number(data.numberOfTravelers);
                
                let errorMsg = null;
                let invalidKey = null;

                if (isNaN(sDate.getTime())) { errorMsg = "Invalid start date. Use YYYY-MM-DD."; invalidKey = 'startDate'; }
                else if (isNaN(eDate.getTime())) { errorMsg = "Invalid end date. Use YYYY-MM-DD."; invalidKey = 'endDate'; }
                else if (eDate <= sDate) { errorMsg = "End date must be after start date."; invalidKey = 'endDate'; }
                else if (isNaN(budget) || budget <= 0) { errorMsg = "Budget must be a positive number."; invalidKey = 'budget'; }
                else if (isNaN(travelers) || travelers < 1) { errorMsg = "Travelers must be at least 1."; invalidKey = 'numberOfTravelers'; }

                if (errorMsg) {
                    data[invalidKey] = '__INVALID__';
                    pendingAction.data = data;
                    pendingAction.step = 'COLLECTING';
                    pendingAction.markModified('data');
                    await pendingAction.save();
                    const invalidQuestion = fieldsOrder.find(f => f.key === invalidKey).question;
                    return res.status(200).json({ response: `${errorMsg}\n\n${invalidQuestion}` });
                }

                pendingAction.data = data;
                pendingAction.step = 'CONFIRMING';
                pendingAction.markModified('data');
                await pendingAction.save();

                let summary = `Trip Name: ${data.tripName}\nDestination: ${formatDest(data.destination)}\nStarting Point: ${data.startingPoint}\nStart Date: ${data.startDate}\nEnd Date: ${data.endDate}\nBudget: ${data.budget}\nTravelers: ${data.numberOfTravelers}\n\nCreate this trip? (Yes/No)`;
                return res.status(200).json({ response: summary });
            }

            // --- DELETE WORKFLOW ---
            else if (pendingAction.action === 'DELETE') {
                const data = pendingAction.get('data') || {};
                
                if (pendingAction.step === 'SELECTING') {
                    const index = parseInt(prompt.trim()) - 1;
                    const trips = data.trips;
                    if (isNaN(index) || index < 0 || index >= trips.length) {
                        return res.status(200).json({ response: "Invalid selection. Please reply with a valid number." });
                    }
                    data.tripId = trips[index]._id;
                    data.tripName = trips[index].tripName;
                    pendingAction.data = data;
                    pendingAction.step = 'CONFIRMING';
                    pendingAction.markModified('data');
                    await pendingAction.save();
                    return res.status(200).json({ response: `Are you sure you want to delete '${trips[index].tripName}'? (Yes/No)` });
                } 
                else if (pendingAction.step === 'CONFIRMING') {
                    if (/\b(yes|sure|ok|confirm|delete)\b/i.test(prompt)) {
                        await Trip.findByIdAndDelete(data.tripId);
                        await PendingAction.findByIdAndDelete(pendingAction._id);
                        return res.status(200).json({ response: `Trip '${data.tripName}' has been deleted successfully.` });
                    } else {
                        await PendingAction.findByIdAndDelete(pendingAction._id);
                        return res.status(200).json({ response: "Deletion cancelled." });
                    }
                }
            }

            // --- UPDATE WORKFLOW ---
            else if (pendingAction.action === 'UPDATE') {
                const data = pendingAction.get('data') || {};
                
                if (pendingAction.step === 'SELECTING') {
                    const index = parseInt(prompt.trim()) - 1;
                    const trips = data.trips;
                    if (isNaN(index) || index < 0 || index >= trips.length) return res.status(200).json({ response: "Invalid selection. Please reply with a valid number." });
                    
                    data.tripId = trips[index]._id;
                    data.tripName = trips[index].tripName;
                    pendingAction.data = data;
                    pendingAction.step = 'ASK_FIELD';
                    pendingAction.markModified('data');
                    await pendingAction.save();
                    return res.status(200).json({ response: `Updating '${trips[index].tripName}'. Which field would you like to update? (e.g., budget, travelers, start date)` });
                }
                else if (pendingAction.step === 'ASK_FIELD') {
                    data.fieldToUpdate = prompt.trim().toLowerCase();
                    pendingAction.data = data;
                    pendingAction.step = 'ASK_VALUE';
                    pendingAction.markModified('data');
                    await pendingAction.save();
                    return res.status(200).json({ response: `What is the new value for ${data.fieldToUpdate}?` });
                }
                else if (pendingAction.step === 'ASK_VALUE') {
                    const field = data.fieldToUpdate;
                    let rawVal = prompt.trim();
                    
                    const blockedValues = ['continue', 'yes', 'no', 'cancel', 'confirm'];
                    if (blockedValues.includes(rawVal.toLowerCase())) {
                        return res.status(200).json({ response: `"${rawVal}" is a reserved system keyword. Please provide a valid value.` });
                    }
                    
                    if (field === 'startdate' || field === 'enddate' || field === 'start date' || field === 'end date') {
                        const dateVal = new Date(rawVal);
                        if (isNaN(dateVal.getTime())) {
                            return res.status(200).json({ response: "Please provide a valid date in YYYY-MM-DD format." });
                        }
                    }
                    if (field === 'budget') {
                        const val = parseFloat(rawVal);
                        if (isNaN(val) || val < 0) {
                            return res.status(200).json({ response: "Please provide a valid positive number for budget." });
                        }
                        rawVal = val;
                    }
                    if (field === 'travelers' || field === 'number of travelers') {
                        const val = parseInt(rawVal);
                        if (isNaN(val) || val <= 0) {
                            return res.status(200).json({ response: "Please provide a valid number of travelers (must be at least 1)." });
                        }
                        rawVal = val;
                    }
                    
                    data.newValue = rawVal;
                    pendingAction.data = data;
                    pendingAction.step = 'CONFIRMING';
                    pendingAction.markModified('data');
                    await pendingAction.save();
                    return res.status(200).json({ response: `Are you sure you want to change '${data.tripName}' ${data.fieldToUpdate} to ${data.newValue}? (Yes/No)` });
                }
                else if (pendingAction.step === 'CONFIRMING') {
                    if (/\b(yes|sure|ok|confirm|update)\b/i.test(prompt)) {
                        const updateObj = {};
                        const field = data.fieldToUpdate;
                        if (field.includes('budget')) updateObj.budget = Number(data.newValue);
                        else if (field.includes('traveler')) updateObj.numberOfTravelers = Number(data.newValue);
                        else if (field.includes('start date')) updateObj.startDate = new Date(data.newValue);
                        else if (field.includes('end date')) updateObj.endDate = new Date(data.newValue);
                        else if (field.includes('starting point')) updateObj.startingPoint = data.newValue;
                        else if (field.includes('name')) updateObj.tripName = data.newValue;
                        else updateObj[field] = data.newValue;

                        const updated = await Trip.findByIdAndUpdate(data.tripId, updateObj, { new: true });
                        await PendingAction.findByIdAndDelete(pendingAction._id);
                        return res.status(200).json({ response: `Success! '${updated.tripName}' has been updated.` });
                    } else {
                        await PendingAction.findByIdAndDelete(pendingAction._id);
                        return res.status(200).json({ response: "Update cancelled." });
                    }
                }
            }

            return res.status(200).json({ response: "I didn't understand that. Please reply to the prompt or type 'cancel'." });
        }

        // 3. NO PENDING CRUD ACTION (New Intent Processing)
        
        // --- CONTEXT RESOLUTION ---
        if (pendingAction && pendingAction.action === 'CONTEXT') {
            const context = pendingAction.data;
            const timeDiff = Date.now() - context.lastQueryTimestamp;
            
            if (timeDiff < 5 * 60 * 1000) { // Valid for 5 minutes
                let resolvedIntent = null;
                const lowerPrompt = prompt.toLowerCase();
                
                if (['READ_TRIPS_COUNT', 'READ_TRIPS_SPECIFIC_COUNT'].includes(context.lastIntent) && /\b(what are those|show them|list them|which ones|show me|show them to me)\b/i.test(lowerPrompt)) {
                    resolvedIntent = 'LIST_TRIPS';
                }
                else if (['READ_TRIPS_HIGHEST', 'READ_TRIPS_CHEAPEST', 'READ_TRIPS_LATEST'].includes(context.lastIntent) && /\b(tell me more|show details|when is it|what's that trip|more info|about it)\b/i.test(lowerPrompt)) {
                    resolvedIntent = 'SHOW_TRIP_DETAILS';
                }
                else if (context.lastIntent === 'READ_TRIPS_DESTINATIONS' && /\b(most expensive|highest budget)\b/i.test(lowerPrompt)) {
                    resolvedIntent = 'FIND_HIGHEST_BUDGET';
                }

                if (resolvedIntent) {
                    console.log(`\n=== CONTEXT RESOLUTION ===`);
                    console.log(`Previous Intent: ${context.lastIntent}`);
                    console.log(`User Prompt: "${prompt}"`);
                    console.log(`Resolved Intent: ${resolvedIntent}`);
                    console.log(`MongoDB Query Executed: YES`);
                    console.log(`=======================\n`);
                    
                    if (resolvedIntent === 'LIST_TRIPS') {
                        let query = { userId };
                        if (context.lastIntent === 'READ_TRIPS_SPECIFIC_COUNT' && context.lastDestination) {
                            query.destination = new RegExp(context.lastDestination, 'i');
                        }
                        const trips = await Trip.find(query).sort({ startDate: -1 });
                        let responseText = `Here are your ${trips.length} trip(s):\n\n`;
                        trips.forEach(trip => {
                            const sd = new Date(trip.startDate).toLocaleDateString();
                            const ed = new Date(trip.endDate).toLocaleDateString();
                            responseText += `- **${trip.tripName}** (${formatDest(trip.destination)})\n  Dates: ${sd} to ${ed}\n  Budget: $${trip.budget}\n\n`;
                        });
                        return res.status(200).json({ response: responseText });
                    }
                    else if (resolvedIntent === 'SHOW_TRIP_DETAILS') {
                        const trip = await Trip.findById(context.lastTripIds[0]);
                        if (trip) {
                            let responseText = `**${trip.tripName}** (${formatDest(trip.destination)})\n\n`;
                            responseText += `- Dates: ${new Date(trip.startDate).toLocaleDateString()} to ${new Date(trip.endDate).toLocaleDateString()}\n`;
                            responseText += `- Budget: $${trip.budget}\n`;
                            responseText += `- Travelers: ${trip.numberOfTravelers}\n`;
                            responseText += `- Starting Point: ${trip.startingPoint}\n`;
                            return res.status(200).json({ response: responseText });
                        }
                    }
                    else if (resolvedIntent === 'FIND_HIGHEST_BUDGET') {
                        const trips = await Trip.find({ userId });
                        if (trips.length > 0) {
                            const highest = trips.reduce((prev, current) => (prev.budget > current.budget) ? prev : current);
                            await PendingAction.findOneAndUpdate(
                                { userId },
                                { action: 'CONTEXT', step: 'IDLE', data: { lastIntent: 'READ_TRIPS_HIGHEST', lastTripIds: [highest._id], lastQueryTimestamp: Date.now() } },
                                { upsert: true }
                            );
                            return res.status(200).json({ response: `Your highest budget trip is **${highest.tripName}** (${formatDest(highest.destination)}) with a budget of $${highest.budget}.` });
                        }
                    }
                }
            }
        }

        if (intent === 'READ_TRIPS') {
            console.log(`MongoDB Retrieval Executed: YES (Fetching user trips)`);
            const userTrips = await Trip.find({ userId });
            if (userTrips.length === 0) return res.status(200).json({ response: `You currently have no trips saved.` });
            
            let reasoningLog = "Generic List";
            let responseText = "";
            let contextData = null;

            if (/\b(?:highest|max|maximum|most expensive)\b/i.test(prompt) || /\bcosts the most\b/i.test(prompt)) {
                reasoningLog = "Finding highest budget trip";
                const highest = userTrips.reduce((prev, current) => (prev.budget > current.budget) ? prev : current);
                responseText = `Your highest budget trip is **${highest.tripName}** (${formatDest(highest.destination)}) with a budget of $${highest.budget}.`;
                contextData = { lastIntent: 'READ_TRIPS_HIGHEST', lastTripIds: [highest._id] };
            }
            else if (/\b(?:cheapest|lowest|min|minimum|least expensive)\b/i.test(prompt) || /\bcosts the least\b/i.test(prompt)) {
                reasoningLog = "Finding lowest budget trip";
                const lowest = userTrips.reduce((prev, current) => (prev.budget < current.budget) ? prev : current);
                responseText = `Your cheapest trip is **${lowest.tripName}** (${formatDest(lowest.destination)}) with a budget of $${lowest.budget}.`;
                contextData = { lastIntent: 'READ_TRIPS_CHEAPEST', lastTripIds: [lowest._id] };
            }
            else if (/\b(?:latest|next|upcoming)\b/i.test(prompt) || /\bwhere am i going\b/i.test(prompt)) {
                reasoningLog = "Finding upcoming/latest trip";
                const upcoming = userTrips.filter(t => new Date(t.startDate) >= new Date()).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
                if (upcoming.length > 0) {
                    const next = upcoming[0];
                    responseText = `Your next trip is **${next.tripName}** to ${formatDest(next.destination)}, starting on ${new Date(next.startDate).toLocaleDateString()}.`;
                    contextData = { lastIntent: 'READ_TRIPS_LATEST', lastTripIds: [next._id] };
                } else {
                    const latest = userTrips.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
                    responseText = `You don't have any upcoming trips planned. Your most recently planned trip was **${latest.tripName}** to ${formatDest(latest.destination)}.`;
                    contextData = { lastIntent: 'READ_TRIPS_LATEST', lastTripIds: [latest._id] };
                }
            }
            else if (/\bhow many trips\b/i.test(prompt)) {
                reasoningLog = "Counting trips";
                responseText = `You have a total of ${userTrips.length} trip(s) saved.`;
                contextData = { lastIntent: 'READ_TRIPS_COUNT' };
            }
            else if (/\b(?:show|list|what are) my (?:trip names|trip titles)\b/i.test(prompt)) {
                reasoningLog = "Listing trip names only";
                const tripNames = userTrips.map(t => `- **${t.tripName}** (${formatDest(t.destination)})`);
                responseText = `Here are the names of your saved trips:\n\n${tripNames.join('\n')}`;
                contextData = { lastIntent: 'READ_TRIPS_NAMES' };
            }
            else if (/\b(?:what|which) (?:destinations|places)\b/i.test(prompt) || /\bwhere (?:have i|am i)\b/i.test(prompt)) {
                reasoningLog = "Extracting unique destinations";
                const destinations = [...new Set(userTrips.map(t => formatDest(t.destination)))];
                responseText = `You have trips saved for the following destinations: ${destinations.join(", ")}.`;
                contextData = { lastIntent: 'READ_TRIPS_DESTINATIONS' };
            }
            else {
                const specificDestMatch = prompt.match(/\b(?:any|a)\s+([a-zA-Z]+)\s+trips?\b/i);
                if (specificDestMatch && !['my', 'saved', 'upcoming', 'latest', 'cheapest', 'highest'].includes(specificDestMatch[1].toLowerCase())) {
                    const searchDest = specificDestMatch[1].trim();
                    reasoningLog = `Checking for specific destination: ${searchDest}`;
                    const matching = userTrips.filter(t => t.destination.toLowerCase().includes(searchDest.toLowerCase()));
                    if (matching.length > 0) {
                        responseText = `Yes! You have ${matching.length} trip(s) to ${formatDest(searchDest)}.`;
                        contextData = { lastIntent: 'READ_TRIPS_SPECIFIC_COUNT', lastDestination: searchDest };
                    } else {
                        responseText = `No, you don't have any trips saved for ${formatDest(searchDest)}.`;
                    }
                } else {
                    reasoningLog = "Generic List of all trips";
                    userTrips.sort((a,b) => new Date(a.startDate) - new Date(b.startDate));
                    responseText = `You have ${userTrips.length} saved trip(s):\n\n`;
                    userTrips.forEach(trip => {
                        const sd = new Date(trip.startDate).toLocaleDateString();
                        const ed = new Date(trip.endDate).toLocaleDateString();
                        responseText += `- **${trip.tripName}** (${formatDest(trip.destination)})\n  Dates: ${sd} to ${ed}\n  Budget: $${trip.budget}\n\n`;
                    });
                    contextData = { lastIntent: 'READ_TRIPS_ALL', lastTripIds: userTrips.map(t => t._id) };
                }
            }

            console.log(`Reasoning Operation: ${reasoningLog}`);
            
            // Save Conversation Context explicitly 
            if (contextData) {
                contextData.lastQueryTimestamp = Date.now();
                await PendingAction.findOneAndUpdate(
                    { userId },
                    { action: 'CONTEXT', step: 'IDLE', data: contextData },
                    { upsert: true }
                );
            }

            return res.status(200).json({ response: responseText });
        }

        if (intent === 'CREATE_TRIP') {
            const createMatch1 = prompt.match(/\b(?:create|add|save|plan)\s+(?:a\s+)?(.+?)\s+trip\b/i);
            const createMatch2 = prompt.match(/\b(?:create|add|save|plan)\s+(?:a\s+)?trip\s+to\s+(.+?)(?:\s+from|\s+with|$)/i);
            let destination = null;
            if (createMatch1) destination = createMatch1[1].trim();
            else if (createMatch2) destination = createMatch2[1].trim();
            
            const data = destination ? { destination: formatDest(destination) } : {};
            // Will safely overwrite CONTEXT if it exists
            await PendingAction.findOneAndUpdate(
                { userId },
                { action: 'CREATE', step: 'COLLECTING', data },
                { upsert: true }
            );
            
            const nextMissingIndex = fieldsOrder.findIndex(f => !data[f.key]);
            return res.status(200).json({ response: fieldsOrder[nextMissingIndex].question });
        }

        if (intent === 'UPDATE_TRIP') {
            let searchTerm = prompt.replace(/\b(?:change|update|modify|edit)\b/i, '').replace(/\b(?:my|a|the)\b/i, '').replace(/\btrips?\b/i, '').trim();
            
            let trips = [];
            if (searchTerm) {
                const safeTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // 1. Try EXACT trip name match first
                trips = await Trip.find({ userId, tripName: new RegExp(`^${safeTerm}$`, 'i') });
                
                // 2. If no exact match, fall back to partial search
                if (trips.length === 0) {
                    trips = await Trip.find({
                        userId,
                        $or: [
                            { tripName: new RegExp(safeTerm, 'i') },
                            { destination: new RegExp(safeTerm, 'i') }
                        ]
                    });
                }
            } else {
                trips = await Trip.find({ userId });
            }
            
            if (trips.length === 0) return res.status(200).json({ response: `I couldn't find any trips to update.` });
            if (trips.length === 1) {
                await PendingAction.findOneAndUpdate({ userId }, { action: 'UPDATE', step: 'ASK_FIELD', data: { tripId: trips[0]._id, tripName: trips[0].tripName } }, { upsert: true });
                return res.status(200).json({ response: `Updating '${trips[0].tripName}'. Which field would you like to update? (e.g., budget, travelers, start date)` });
            } else {
                await PendingAction.findOneAndUpdate({ userId }, { action: 'UPDATE', step: 'SELECTING', data: { trips } }, { upsert: true });
                let responseText = `I found multiple trips:\n\n`;
                trips.forEach((t, i) => { responseText += `${i + 1}. **${t.tripName}** (${formatDest(t.destination)})\n`; });
                responseText += `\nWhich one would you like to update? (Reply with number)`;
                return res.status(200).json({ response: responseText });
            }
        }

        if (intent === 'DELETE_TRIP') {
            let searchTerm = prompt.replace(/\b(?:delete|remove|cancel)\b/i, '').replace(/\b(?:my|a|the)\b/i, '').replace(/\btrips?\b/i, '').trim();
            
            let trips = [];
            if (searchTerm) {
                const safeTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // 1. Try EXACT trip name match first
                trips = await Trip.find({ userId, tripName: new RegExp(`^${safeTerm}$`, 'i') });
                
                // 2. If no exact match, fall back to partial search
                if (trips.length === 0) {
                    trips = await Trip.find({
                        userId,
                        $or: [
                            { tripName: new RegExp(safeTerm, 'i') },
                            { destination: new RegExp(safeTerm, 'i') }
                        ]
                    });
                }
            } else {
                trips = await Trip.find({ userId });
            }
            
            if (trips.length === 0) return res.status(200).json({ response: `I couldn't find any trips to delete.` });
            if (trips.length === 1) {
                await PendingAction.findOneAndUpdate({ userId }, { action: 'DELETE', step: 'CONFIRMING', data: { tripId: trips[0]._id, tripName: trips[0].tripName } }, { upsert: true });
                return res.status(200).json({ response: `Are you sure you want to delete '${trips[0].tripName}'? (Yes/No)` });
            } else {
                await PendingAction.findOneAndUpdate({ userId }, { action: 'DELETE', step: 'SELECTING', data: { trips } }, { upsert: true });
                let responseText = `I found multiple trips:\n\n`;
                trips.forEach((t, i) => { responseText += `${i + 1}. **${t.tripName}** (${formatDest(t.destination)})\n`; });
                responseText += `\nWhich trip would you like to delete? (Reply with number)`;
                return res.status(200).json({ response: responseText });
            }
        }

        // 4. FALLBACK TO GROQ FOR TRAVEL ADVICE / CHAT
        const formattedHistory = (history || []).map(msg => ({ role: msg.role, content: msg.content }));
        const messages = [{ role: "system", content: systemPrompt }, ...formattedHistory, { role: "user", content: prompt }];
        
        try {
            if (simulateOutage) {
                throw new Error("Simulated Outage");
            }
            const chatCompletion = await groq.chat.completions.create({
                messages: messages,
                model: "llama-3.3-70b-versatile",
            });
            const responseText = chatCompletion.choices[0]?.message?.content || "";
            return res.status(200).json({ response: responseText });
        } catch (e) {
            if (process.env.NODE_ENV !== 'production') {
                console.error("\n=== GROQ GENERATION ERROR ===");
                console.error(e.message || e);
                console.error("=============================\n");
            }
            return res.status(200).json({ response: "I'm having trouble connecting to my knowledge base right now. Please try again later." });
        }

    } catch (error) {
        if (process.env.NODE_ENV !== 'production') console.error("API Error Detail:", error);
        res.status(500).json({ message: "Failed to process request.", stack: error.stack });
    }
};

module.exports = {
    generateChatResponse
};
