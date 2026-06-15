const jwt = require('jsonwebtoken');

// This middleware function protects our private routes.
// It intercepts the request before it reaches the controller,
// checks if a valid token is present, and if so, attaches the user's ID to the request.
const protect = async (req, res, next) => {
    let token;

    // We expect the token to be sent in the 'Authorization' header as a Bearer token
    // Example: Authorization: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Split "Bearer <token>" and grab just the token part
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using our secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach the decoded user ID to the request object so the controller can use it
            // We use 'userId' because that's what we will embed in the token during login
            req.user = { id: decoded.userId };

            // Move on to the next function (the controller)
            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401);
            return next(new Error('Not authorized, token failed'));
        }
    }

    if (!token) {
        res.status(401);
        return next(new Error('Not authorized, no token'));
    }
};

module.exports = { protect };
