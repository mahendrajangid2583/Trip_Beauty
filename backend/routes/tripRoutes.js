import express from 'express';
import Trip from '../models/Trip.js';
import passport from 'passport';
import crypto from 'crypto';

const router = express.Router();

// Middleware to protect routes
const protect = passport.authenticate('jwt', { session: false });

// Helper to check permission
const hasEditPermission = (trip, userId) => {
    if (trip.user.toString() === userId.toString()) return true;
    if (trip.owner && trip.owner.toString() === userId.toString()) return true;
    if (trip.collaborators.some(c => c.user.toString() === userId.toString() && c.role === 'editor')) return true;
    return false;
};

// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { name, timeConstraint } = req.body;
        const shareToken = crypto.randomBytes(16).toString('hex');

        const trip = await Trip.create({
            user: req.user._id,
            owner: req.user._id,
            name,
            timeConstraint,
            places: [],
            shareToken
        });

        res.status(201).json(trip);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Get user trips (owned + collaborated)
// @route   GET /api/trips
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const trips = await Trip.find({
            $or: [
                { user: req.user._id },
                { owner: req.user._id },
                { 'collaborators.user': req.user._id }
            ]
        }).sort({ createdAt: -1 });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get Share Link
// @route   GET /api/trips/:id/share-link
// @access  Private (Owner only)
router.get('/:id/share-link', protect, async (req, res) => {
    try {
        const trip = await Trip.findOne({ _id: req.params.id });

        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        // Only owner can get the link (or maybe collaborators too? Prompt says "Regenerate Link (Owner only)", implies getting it might be open or owner only. Let's allow owner and collaborators to SEE it, but only owner to regenerate if we implemented that)
        // For now, let's restrict to owner for security, or allow if they have access.
        if (trip.user.toString() !== req.user._id.toString() && trip.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to share this trip' });
        }

        if (!trip.shareToken) {
            trip.shareToken = crypto.randomBytes(16).toString('hex');
            await trip.save();
        }

        // Assuming frontend URL structure
        const shareLink = `http://localhost:5173/join/${trip.shareToken}`;
        res.json({ shareLink, shareToken: trip.shareToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Generate Share Token
// @route   PATCH /api/trips/:id/generate-token
// @access  Private (Owner only)
router.patch('/:id/generate-token', protect, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        // Only owner can generate token
        if (trip.user.toString() !== req.user._id.toString() && trip.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (!trip.shareToken) {
            trip.shareToken = crypto.randomBytes(16).toString('hex');
            await trip.save();
        }

        res.json({ shareToken: trip.shareToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Join Trip via Token
// @route   POST /api/trips/join/:shareToken
// @access  Private
router.post('/join/:shareToken', protect, async (req, res) => {
    try {
        const trip = await Trip.findOne({ shareToken: req.params.shareToken });

        if (!trip) {
            return res.status(404).json({ message: 'Invalid invite link' });
        }

        // Check if already joined or owner
        const isOwner = trip.user.toString() === req.user._id.toString() || (trip.owner && trip.owner.toString() === req.user._id.toString());
        const isCollaborator = trip.collaborators.some(c => c.user.toString() === req.user._id.toString());

        if (isOwner || isCollaborator) {
            return res.json({ message: 'Already a member', tripId: trip._id });
        }

        // Add to collaborators
        trip.collaborators.push({ user: req.user._id, role: 'editor' });
        await trip.save();

        res.json({ message: 'Joined trip successfully', tripId: trip._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Add a place to a trip
// @route   POST /api/trips/:id/places
// @access  Private
router.post('/:id/places', protect, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (!hasEditPermission(trip, req.user._id)) {
            return res.status(403).json({ message: 'Not authorized to edit this trip' });
        }

        const { name, lat, lng, estimatedTime, notes, image, description, source } = req.body;

        const newPlace = {
            name,
            lat,
            lng,
            estimatedTime: estimatedTime || 0,
            notes,
            status: 'pending',
            aiTimeStatus: 'pending', // Initialize AI status
            image,
            description,
            source
        };

        trip.places.push(newPlace);
        await trip.save();

        // Return the actual saved place (with _id)
        const savedPlace = trip.places[trip.places.length - 1];
        res.json(savedPlace);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update place status
// @route   PATCH /api/trips/:tripId/places/:placeId
// @access  Private
router.patch('/:tripId/places/:placeId', protect, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        if (!hasEditPermission(trip, req.user._id)) return res.status(403).json({ message: 'Not authorized' });

        const place = trip.places.id(req.params.placeId);
        if (!place) return res.status(404).json({ message: 'Place not found' });

        if (req.body.status !== undefined) {
            place.status = req.body.status;
            
            // Sync with itinerary items
            if (trip.itinerary && trip.itinerary.length > 0) {
                trip.itinerary.forEach(day => {
                    day.items.forEach(item => {
                        // Match by externalId if available, or name/lat/lng fallback?
                        // We added externalId to place, and itinerary item has 'id'.
                        if (place.externalId && item.id === place.externalId) {
                            item.status = req.body.status;
                        } else if (!place.externalId && item.name === place.name) {
                             // Fallback match by name
                             item.status = req.body.status;
                        }
                    });
                });
            }
        }
        if (req.body.estimatedTime !== undefined) place.estimatedTime = req.body.estimatedTime;
        if (req.body.aiTimeStatus !== undefined) place.aiTimeStatus = req.body.aiTimeStatus;

        await trip.save();
        // Return only the updated place data
        res.json({ status: place.status, estimatedTime: place.estimatedTime, aiTimeStatus: place.aiTimeStatus });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const trip = await Trip.findOne({ _id: req.params.id });

        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        // Only owner can delete
        if (trip.user.toString() !== req.user._id.toString() && trip.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the owner can delete this trip' });
        }

        await trip.deleteOne();
        res.json({ message: 'Trip removed', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update trip status
// @route   PATCH /api/trips/:id/status
// @access  Private
router.patch('/:id/status', protect, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);

        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        if (!hasEditPermission(trip, req.user._id)) return res.status(403).json({ message: 'Not authorized' });

        if (req.body.status) trip.status = req.body.status;

        await trip.save();
        // Return only the updated status
        res.json({ status: trip.status });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Delete a place from a trip
// @route   DELETE /api/trips/:tripId/places/:placeId
// @access  Private
router.delete('/:tripId/places/:placeId', protect, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        if (!hasEditPermission(trip, req.user._id)) return res.status(403).json({ message: 'Not authorized' });

        trip.places.pull(req.params.placeId);
        await trip.save();

        // Return success message
        res.json({ message: 'Place deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Update itinerary item status (e.g. visited)
// @route   PATCH /api/trips/:tripId/itinerary/:itemId/status
// @access  Private
router.patch('/:tripId/itinerary/:itemId/status', protect, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        if (!hasEditPermission(trip, req.user._id)) return res.status(403).json({ message: 'Not authorized' });

        // Find the item in the nested array
        let foundItem = null;
        for (const day of trip.itinerary) {
            const item = day.items.id(req.params.itemId);
            if (item) {
                foundItem = item;
                break;
            }
        }

        if (!foundItem) return res.status(404).json({ message: 'Itinerary item not found' });

        if (req.body.status) {
            foundItem.status = req.body.status;

            // Sync with places array
            // foundItem has 'id' which corresponds to place.externalId
            if (foundItem.id && trip.places) {
                const place = trip.places.find(p => p.externalId === foundItem.id);
                if (place) {
                    place.status = req.body.status;
                }
            } else if (trip.places) {
                // Fallback by name
                const place = trip.places.find(p => p.name === foundItem.name);
                if (place) {
                    place.status = req.body.status;
                }
            }
        }

        await trip.save();
        res.json({ status: foundItem.status, itemId: foundItem._id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
