const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');

// Storage config
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/'); // Make sure uploads folder exists
    },
    filename: function(req, file, cb) {
        // Create unique filename
        cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 20 } // 20MB limit
});

// @desc    Upload a file
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('media'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file' });
    }

    // Return the URL path
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

module.exports = router;
