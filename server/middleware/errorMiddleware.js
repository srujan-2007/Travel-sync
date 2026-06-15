const errorHandler = (err, req, res, next) => {
    // If status code is already set (e.g. 400 Bad Request), keep it, otherwise default to 500
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Handle Mongoose Validation Errors
    if (err.name === 'ValidationError') {
        statusCode = 400; // Bad Request
        message = Object.values(err.errors).map((val) => val.message).join(', ');
    }
    
    // Handle Mongoose Cast Errors (Invalid ObjectId)
    else if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404; // Not Found
        message = 'Resource not found. Invalid ID format.';
    }

    // Handle Mongoose Duplicate Key Errors (e.g. unique username)
    else if (err.code === 11000) {
        statusCode = 400; // Bad Request
        message = 'Duplicate field value entered';
    }

    res.status(statusCode).json({
        message: message,
        // Only show stack trace in development
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { errorHandler };
