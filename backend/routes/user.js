import express from 'express';
import User from '../models/User.js';
import protect from '../middlewares/auth.js';

const router = express.Router();

// @desc    Get user bookmarks
// @route   GET /api/user/bookmarks
// @access  Private
router.get('/bookmarks', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('bookmarks');
        res.json(user.bookmarks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Add a bookmark
// @route   POST /api/user/bookmarks
// @access  Private
router.post('/bookmarks', protect, async (req, res) => {
    const { id, name, lat, lng, image, description, source } = req.body;

    try {
        const user = await User.findById(req.user.id);

        // Check if already exists
        const exists = user.bookmarks.some(b =>
            (b.id && b.id === id) || (b.name === name && b.lat === lat && b.lng === lng)
        );

        if (exists) {
            return res.status(400).json({ message: 'Place already bookmarked' });
        }

        const newBookmark = { id, name, lat, lng, image, description, source };
        user.bookmarks.push(newBookmark);
        await user.save();

        res.json(user.bookmarks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Remove a bookmark
// @route   DELETE /api/user/bookmarks/:id
// @access  Private
router.delete('/bookmarks/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        // Filter out the bookmark. 
        // Note: The frontend might send the Mongo _id of the bookmark subdocument OR the external 'id'.
        // We'll try to match both for robustness, or rely on the frontend sending the correct identifier.
        // Since we are pushing objects, Mongoose adds an _id to them.

        // If the ID passed is a Mongo ObjectId, we can use pull.
        // If it's an external ID, we filter.

        // Let's assume the frontend sends the unique identifier it has.
        // If it's a saved bookmark, it has an _id.

        user.bookmarks = user.bookmarks.filter(b =>
            b._id.toString() !== req.params.id && b.id !== req.params.id
        );

        await user.save();
        res.json(user.bookmarks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
