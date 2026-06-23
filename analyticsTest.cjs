const axios = require('axios');

async function testAnalytics() {
  const API_URL = 'http://localhost:5000/api';
  let token = null;

  try {
    const username = `test_analytics_${Date.now()}`;
    await axios.post(`${API_URL}/auth/signup`, {
      name: 'Analytics Tester',
      username: username,
      mobileNumber: '1234567890',
      password: 'password123'
    });

    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      username: username,
      password: 'password123'
    });
    token = loginRes.data.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 1. Create a few trips
    const trip1 = await axios.post(`${API_URL}/trips`, {
      tripName: 'Paris Trip', startingPoint: 'NY', destination: 'Paris',
      startDate: '2027-05-01', endDate: '2027-05-10', budget: 3000, numberOfTravelers: 2
    }, config);

    const trip2 = await axios.post(`${API_URL}/trips`, {
      tripName: 'London Trip', startingPoint: 'NY', destination: 'London',
      startDate: '2027-06-01', endDate: '2027-06-10', budget: 4000, numberOfTravelers: 2
    }, config);

    // 2. Add expenses
    await axios.post(`${API_URL}/expenses`, {
      tripId: trip1.data._id, category: 'Food & Dining', amount: 150, date: '2027-05-02'
    }, config);
    await axios.post(`${API_URL}/expenses`, {
      tripId: trip1.data._id, category: 'Flights', amount: 800, date: '2027-04-01'
    }, config);
    await axios.post(`${API_URL}/expenses`, {
      tripId: trip2.data._id, category: 'Food & Dining', amount: 200, date: '2027-06-02'
    }, config);

    // 3. Fetch analytics
    console.log('\n--- FETCHING ANALYTICS ---');
    const summary = await axios.get(`${API_URL}/analytics/summary`, config);
    console.log('Summary:', summary.data);

    const expensesByCategory = await axios.get(`${API_URL}/analytics/expenses-by-category`, config);
    console.log('Expenses By Category:', expensesByCategory.data);

    const topDestinations = await axios.get(`${API_URL}/analytics/top-destinations`, config);
    console.log('Top Destinations:', topDestinations.data);

    const tripsByMonth = await axios.get(`${API_URL}/analytics/trips-by-month`, config);
    console.log('Trips By Month:', tripsByMonth.data);

    if (summary.data.totalTrips === 2 && summary.data.totalExpenses === 1150) {
      console.log('\n✅ ANALYTICS TESTS PASSED!');
    } else {
      console.error('\n❌ ANALYTICS TESTS FAILED - Invalid aggregation results');
    }
  } catch (err) {
    console.error('Test Error:', err.response ? err.response.data : err.message);
  }
}

testAnalytics();
