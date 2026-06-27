const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const { signup, login, googleLogin } = require('./controllers/authController');

// Mock response object helper
const mockResponse = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.body = data;
        return res;
    };
    return res;
};

// Mock next middleware function
const mockNext = (err) => {
    if (err) {
        throw err;
    }
};

async function runTests() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        // Clear existing test users
        await User.deleteMany({ username: /test.*@gmail\.com|testuser_local/ });
        console.log("Cleared prior test users.");

        // -------------------------------------------------------------
        // TEST 1 & 2: Local Signup and Login
        // -------------------------------------------------------------
        console.log("\n--- TEST 1: Local Password Signup ---");
        const signupReq = {
            body: {
                name: 'Local Test User',
                username: 'testuser_local@gmail.com',
                mobileNumber: '1234567890',
                password: 'password123'
            }
        };
        const signupRes = mockResponse();
        await signup(signupReq, signupRes, mockNext);
        console.log("Signup Response Status:", signupRes.statusCode || 200);
        console.log("Signup Response Body:", signupRes.body);
        
        const localUserId = signupRes.body._id;
        if (signupRes.body.token) {
            console.log("TEST 1 PASSED: JWT Token generated successfully.");
        } else {
            throw new Error("TEST 1 FAILED: No token generated");
        }

        console.log("\n--- TEST 2: Local Password Login ---");
        const loginReq = {
            body: {
                username: 'testuser_local@gmail.com',
                password: 'password123'
            }
        };
        const loginRes = mockResponse();
        await login(loginReq, loginRes, mockNext);
        console.log("Login Response Body:", loginRes.body);
        if (loginRes.body.token) {
            console.log("TEST 2 PASSED: Local login works perfectly.");
        } else {
            throw new Error("TEST 2 FAILED: Local login failed");
        }

        // -------------------------------------------------------------
        // TEST 3: New Google User Auto-registration
        // -------------------------------------------------------------
        console.log("\n--- TEST 3: Google Login (New User) ---");
        
        // Mock token verification payload by overriding GoogleClient verification in this test
        const authController = require('./controllers/authController');
        
        // We will simulate the googleLogin method by constructing a direct request.
        // To mock verifyIdToken we stub the googleClient instance in our test environment
        const googleAuthLib = require('google-auth-library');
        const originalVerify = googleAuthLib.OAuth2Client.prototype.verifyIdToken;
        
        googleAuthLib.OAuth2Client.prototype.verifyIdToken = async function(options) {
            if (options.idToken === 'valid-mock-token-new') {
                return {
                    getPayload: () => ({
                        sub: 'google-id-12345',
                        email: 'testgoogle_new@gmail.com',
                        name: 'Google New User',
                        picture: 'https://lh3.googleusercontent.com/a/mock-avatar-new'
                    })
                };
            }
            if (options.idToken === 'valid-mock-token-existing') {
                return {
                    getPayload: () => ({
                        sub: 'google-id-12345',
                        email: 'testgoogle_new@gmail.com',
                        name: 'Google New User',
                        picture: 'https://lh3.googleusercontent.com/a/mock-avatar-new'
                    })
                };
            }
            if (options.idToken === 'valid-mock-token-link') {
                return {
                    getPayload: () => ({
                        sub: 'google-id-99999',
                        email: 'testuser_local@gmail.com', // same email as local user
                        name: 'Local Test User',
                        picture: 'https://lh3.googleusercontent.com/a/mock-avatar-linked'
                    })
                };
            }
            throw new Error('Invalid token');
        };

        const googleNewReq = { body: { idToken: 'valid-mock-token-new' } };
        const googleNewRes = mockResponse();
        
        await googleLogin(googleNewReq, googleNewRes, mockNext);
        console.log("Google New User Response:", googleNewRes.body);
        
        const createdUser = await User.findOne({ username: 'testgoogle_new@gmail.com' });
        if (createdUser && createdUser.googleId === 'google-id-12345' && createdUser.provider === 'google') {
            console.log("TEST 3 PASSED: Account automatically created with Google ID and Provider details.");
        } else {
            throw new Error("TEST 3 FAILED: Account was not properly created.");
        }

        // -------------------------------------------------------------
        // TEST 4: Existing Google User Login
        // -------------------------------------------------------------
        console.log("\n--- TEST 4: Google Login (Existing User) ---");
        const googleExistReq = { body: { idToken: 'valid-mock-token-existing' } };
        const googleExistRes = mockResponse();
        
        await googleLogin(googleExistReq, googleExistRes, mockNext);
        console.log("Google Existing User Response:", googleExistRes.body);
        
        const totalGoogleUsers = await User.countDocuments({ username: 'testgoogle_new@gmail.com' });
        if (totalGoogleUsers === 1) {
            console.log("TEST 4 PASSED: Logged in successfully, no duplicate account created.");
        } else {
            throw new Error(`TEST 4 FAILED: Duplicate Google users created! Total: ${totalGoogleUsers}`);
        }

        // -------------------------------------------------------------
        // TEST 5: Account Linking (Local email + Google login)
        // -------------------------------------------------------------
        console.log("\n--- TEST 5: Google Account Linking (Same Email) ---");
        const googleLinkReq = { body: { idToken: 'valid-mock-token-link' } };
        const googleLinkRes = mockResponse();
        
        await googleLogin(googleLinkReq, googleLinkRes, mockNext);
        console.log("Google Linked Response:", googleLinkRes.body);
        
        const linkedUser = await User.findOne({ username: 'testuser_local@gmail.com' });
        if (linkedUser && linkedUser.googleId === 'google-id-99999' && linkedUser.provider === 'google') {
            console.log("TEST 5 PASSED: Linked Google details successfully to existing password user.");
        } else {
            throw new Error("TEST 5 FAILED: Account linking failed or duplicates created.");
        }

        // Verify password still works for password users after linking
        const localLoginAfterLinkReq = {
            body: {
                username: 'testuser_local@gmail.com',
                password: 'password123'
            }
        };
        const localLoginAfterLinkRes = mockResponse();
        await login(localLoginAfterLinkReq, localLoginAfterLinkRes, mockNext);
        if (localLoginAfterLinkRes.body.token) {
            console.log("TEST 5 PASSWORD CHECK PASSED: Local password login still works after account linking.");
        } else {
            throw new Error("TEST 5 PASSWORD CHECK FAILED: Local login broken after linking Google account.");
        }

        // -------------------------------------------------------------
        // TEST 6: JWT format validation
        // -------------------------------------------------------------
        console.log("\n--- TEST 6: JWT Verification ---");
        const decoded = jwt.verify(googleLinkRes.body.token, process.env.JWT_SECRET);
        console.log("Decoded Token Payload:", decoded);
        if (decoded.userId && decoded.userId === linkedUser._id.toString()) {
            console.log("TEST 6 PASSED: JWT structure and signature match the original system.");
        } else {
            throw new Error("TEST 6 FAILED: Invalid JWT token payload");
        }

        // Restore original verify method
        googleAuthLib.OAuth2Client.prototype.verifyIdToken = originalVerify;

        console.log("\nAll Google Auth database/logic tests passed successfully!");
        process.exit(0);

    } catch (err) {
        console.error("Test execution failed with error:", err.message);
        process.exit(1);
    }
}

runTests();
