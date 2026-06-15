const axios = require('axios');

async function runQA() {
  const API_URL = 'http://localhost:5000/api';
  let token = null;
  let tripId = null;

  try {
    console.log('--- TEST FLOW 2: SIGNUP & LOGIN ---');
    const username = `qa_${Date.now()}`;
    // 1. Signup
    console.log('Attempting signup with username:', username);
    const signupRes = await axios.post(`${API_URL}/auth/signup`, {
      name: 'QA Tester',
      username: username,
      mobileNumber: '1234567890',
      password: 'password123'
    });
    console.log('Signup Response:', signupRes.status);

    // 2. Login
    console.log('Attempting login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      username: username,
      password: 'password123'
    });
    console.log('Login Response:', loginRes.status, 'Token received:', !!loginRes.data.token);
    token = loginRes.data.token;
    
    const config = { headers: { Authorization: `Bearer ${token}` } };

    console.log('\n--- TEST FLOW 3: CREATE TRIP ---');
    console.log('Attempting to create trip...');
    const createTripRes = await axios.post(`${API_URL}/trips`, {
      tripName: 'QA Test Trip',
      startingPoint: 'New York',
      destination: 'London',
      startDate: '2027-01-01',
      endDate: '2027-01-10',
      budget: 5000,
      numberOfTravelers: 2
    }, config);
    tripId = createTripRes.data._id;
    console.log('Trip Created! ID:', tripId);

    // Verify trip appears in list
    console.log('Fetching user trips...');
    const getTripsRes = await axios.get(`${API_URL}/trips`, config);
    console.log('Trips retrieved:', getTripsRes.data.length);
    if (!getTripsRes.data.find(t => t._id === tripId)) {
      throw new Error("Created trip not found in list!");
    }

    console.log('\n--- TEST FLOW 4: VIEW TRIP DETAILS ---');
    console.log('Fetching trip details...');
    const getTripRes = await axios.get(`${API_URL}/trips/${tripId}`, config);
    console.log('Trip Details Retrieved:', getTripRes.data.tripName);

    console.log('\n--- TEST FLOW 4.2: ADD EXPENSE ---');
    console.log('Attempting to add expense...');
    const addExpRes = await axios.post(`${API_URL}/expenses`, {
      tripId: tripId,
      category: 'Food & Dining',
      amount: 45.50,
      date: '2027-01-02',
      description: 'Dinner in New York'
    }, config);
    const expenseId = addExpRes.data._id;
    console.log('Expense Added! ID:', expenseId);

    console.log('\n--- TEST FLOW 4.3: EDIT EXPENSE ---');
    console.log('Attempting to edit expense...');
    const editExpRes = await axios.put(`${API_URL}/expenses/${expenseId}`, {
      tripId: tripId,
      category: 'Food & Dining',
      amount: 55.00,
      date: '2027-01-02',
      description: 'Fancy Dinner in New York'
    }, config);
    console.log('Expense Edited. New Amount:', editExpRes.data.amount);

    console.log('Fetching expenses to verify edit...');
    const getExpRes = await axios.get(`${API_URL}/expenses/trip/${tripId}`, config);
    console.log('Expenses retrieved. Count:', getExpRes.data.length);
    if (getExpRes.data[0].amount !== 55) throw new Error("Expense edit failed!");

    console.log('\n--- TEST FLOW 4.4: DELETE EXPENSE ---');
    console.log('Attempting to delete expense...');
    const delExpRes = await axios.delete(`${API_URL}/expenses/${expenseId}`, config);
    console.log('Expense Deleted Response:', delExpRes.status);

    console.log('\n--- TEST FLOW 4.5: ADD MEMORY ---');
    console.log('Attempting to add memory...');
    const addMemRes = await axios.post(`${API_URL}/memories`, {
      tripId: tripId,
      mediaType: 'Photo',
      mediaUrl: 'https://example.com/photo.jpg',
      date: '2027-01-02',
      caption: 'Beautiful view',
      travelNote: 'Had a great time.'
    }, config);
    const memoryId = addMemRes.data._id;
    console.log('Memory Added! ID:', memoryId);

    console.log('\n--- TEST FLOW 4.6: EDIT MEMORY ---');
    console.log('Attempting to edit memory...');
    const editMemRes = await axios.put(`${API_URL}/memories/${memoryId}`, {
      tripId: tripId,
      mediaType: 'Photo',
      mediaUrl: 'https://example.com/photo2.jpg',
      date: '2027-01-03',
      caption: 'Updated view',
      travelNote: 'Still having a great time.'
    }, config);
    console.log('Memory Edited. New Caption:', editMemRes.data.caption);

    console.log('Fetching memories to verify edit...');
    const getMemRes = await axios.get(`${API_URL}/memories/trip/${tripId}`, config);
    console.log('Memories retrieved. Count:', getMemRes.data.length);
    if (getMemRes.data[0].caption !== 'Updated view') throw new Error("Memory edit failed!");

    console.log('\n--- TEST FLOW 4.7: DELETE MEMORY ---');
    console.log('Attempting to delete memory...');
    const delMemRes = await axios.delete(`${API_URL}/memories/${memoryId}`, config);
    console.log('Memory Deleted Response:', delMemRes.status);

    console.log('\n--- TEST FLOW 4.8: ADD ACTIVITY ---');
    console.log('Attempting to add activity...');
    const addActRes = await axios.post(`${API_URL}/activities`, {
      tripId: tripId,
      activityName: 'Scuba Diving',
      place: 'Coral Reef',
      date: '2027-01-02',
      time: '10:00'
    }, config);
    const activityId = addActRes.data._id;
    console.log('Activity Added! ID:', activityId);

    console.log('\n--- TEST FLOW 4.9: EDIT ACTIVITY ---');
    console.log('Attempting to edit activity...');
    const editActRes = await axios.put(`${API_URL}/activities/${activityId}`, {
      tripId: tripId,
      activityName: 'Deep Scuba Diving',
      place: 'Coral Reef North',
      date: '2027-01-03',
      time: '11:00'
    }, config);
    console.log('Activity Edited. New Name:', editActRes.data.activityName);

    console.log('Fetching activities to verify edit...');
    const getActRes = await axios.get(`${API_URL}/activities/trip/${tripId}`, config);
    console.log('Activities retrieved. Count:', getActRes.data.length);
    if (getActRes.data[0].activityName !== 'Deep Scuba Diving') throw new Error("Activity edit failed!");

    console.log('\n--- TEST FLOW 4.10: DELETE ACTIVITY ---');
    console.log('Attempting to delete activity...');
    const delActRes = await axios.delete(`${API_URL}/activities/${activityId}`, config);
    console.log('Activity Deleted Response:', delActRes.status);

    console.log('\n--- TEST FLOW 4.11: ADD LOCATION ---');
    console.log('Attempting to add location...');
    const addLocRes = await axios.post(`${API_URL}/locations`, {
      tripId: tripId,
      placeName: 'Eiffel Tower',
      visitDate: '2027-01-02',
      visitTime: '15:00'
    }, config);
    const locationId = addLocRes.data._id;
    console.log('Location Added! ID:', locationId);

    console.log('\n--- TEST FLOW 4.12: EDIT LOCATION ---');
    console.log('Attempting to edit location...');
    const editLocRes = await axios.put(`${API_URL}/locations/${locationId}`, {
      tripId: tripId,
      placeName: 'The Louvre',
      visitDate: '2027-01-03',
      visitTime: '10:00'
    }, config);
    console.log('Location Edited. New Name:', editLocRes.data.placeName);

    console.log('Fetching locations to verify edit...');
    const getLocRes = await axios.get(`${API_URL}/locations/trip/${tripId}`, config);
    console.log('Locations retrieved. Count:', getLocRes.data.length);
    if (getLocRes.data[0].placeName !== 'The Louvre') throw new Error("Location edit failed!");

    console.log('\n--- TEST FLOW 4.13: DELETE LOCATION ---');
    console.log('Attempting to delete location...');
    const delLocRes = await axios.delete(`${API_URL}/locations/${locationId}`, config);
    console.log('Location Deleted Response:', delLocRes.status);

    console.log('\n--- TEST FLOW 4.14: ADD ITINERARY ---');
    console.log('Attempting to add itinerary...');
    const addItinRes = await axios.post(`${API_URL}/itineraries`, {
      tripId: tripId,
      dayNumber: 1,
      place: 'The Colosseum',
      activity: 'Guided tour of the underground levels',
      time: '09:00'
    }, config);
    const itineraryId = addItinRes.data._id;
    console.log('Itinerary Added! ID:', itineraryId);

    console.log('\n--- TEST FLOW 4.15: EDIT ITINERARY ---');
    console.log('Attempting to edit itinerary...');
    const editItinRes = await axios.put(`${API_URL}/itineraries/${itineraryId}`, {
      tripId: tripId,
      dayNumber: 1,
      place: 'The Colosseum & Forum',
      activity: 'Extended guided tour',
      time: '08:30'
    }, config);
    console.log('Itinerary Edited. New Place:', editItinRes.data.place);

    console.log('Fetching itineraries to verify edit...');
    const getItinRes = await axios.get(`${API_URL}/itineraries/trip/${tripId}`, config);
    console.log('Itineraries retrieved. Count:', getItinRes.data.length);
    if (getItinRes.data[0].place !== 'The Colosseum & Forum') throw new Error("Itinerary edit failed!");

    console.log('\n--- TEST FLOW 4.16: DELETE ITINERARY ---');
    console.log('Attempting to delete itinerary...');
    const delItinRes = await axios.delete(`${API_URL}/itineraries/${itineraryId}`, config);
    console.log('Itinerary Deleted Response:', delItinRes.status);

    console.log('\n--- TEST FLOW 4.17: UPDATE TRIP ---');
    console.log('Attempting to update trip...');
    const updateTripRes = await axios.put(`${API_URL}/trips/${tripId}`, {
      tripName: 'Updated QA Test Trip',
      startingPoint: 'New York',
      destination: 'London',
      startDate: '2027-01-01',
      endDate: '2027-01-10',
      budget: 6000,
      numberOfTravelers: 3
    }, config);
    console.log('Update Trip Response:', updateTripRes.status, updateTripRes.data.tripName);

    console.log('\n--- TEST FLOW 5: DELETE TRIP ---');
    console.log('Attempting to delete trip...');
    const delRes = await axios.delete(`${API_URL}/trips/${tripId}`, config);
    console.log('Delete Response:', delRes.status);

    console.log('Verifying trip is gone...');
    const getTripsRes2 = await axios.get(`${API_URL}/trips`, config);
    if (getTripsRes2.data.find(t => t._id === tripId)) {
      throw new Error("Trip still exists after deletion!");
    }
    console.log('Trip successfully deleted.');

    console.log('\nALL API BACKEND TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('QA TEST FAILED!', err.response ? err.response.data : err.message);
  }
}

runQA();
