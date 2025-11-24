import express from 'express';
import Review from '../models/Review.js';
import passport from 'passport';

const router = express.Router();

// Middleware to protect routes
const protect = passport.authenticate('jwt', { session: false });

// GET /api/reviews - Public (anyone can view)
router.get('/', async (req, res) => {
    try {
        const sort = req.query.sort === 'rating_desc' ? { rating: -1 } : { createdAt: -1 };
        const reviews = await Review.find()
            .populate('user', 'name handle') // Populate user's name and handle
            .sort(sort);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/reviews - Protected (only logged-in users)
router.post('/', protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        // Create review with user reference
        const review = new Review({
            user: req.user._id, // From JWT middleware
            rating,
            comment
        });

        const savedReview = await review.save();

        // Populate user data before sending response
        const populatedReview = await Review.findById(savedReview._id)
            .populate('user', 'name handle');

        res.status(201).json(populatedReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /api/reviews/:id - Protected (owner only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns the review
        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        await review.deleteOne();
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// TEMPORARY: Delete all reviews (remove this after using once)
router.delete('/admin/clear-all', async (req, res) => {
    try {
        const result = await Review.deleteMany({});
        res.json({ message: `Deleted ${result.deletedCount} reviews` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
