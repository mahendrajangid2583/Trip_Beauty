import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    lat: {
        type: Number,
        required: true
    },
    lng: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'visited', 'skipped'],
        default: 'pending'
    },
    estimatedTime: {
        type: String, // Changed to String to support "1 hr 30 mins"
        default: null
    },
    aiTimeStatus: {
        type: String,
        enum: ['pending', 'verified', 'failed'],
        default: 'pending'
    },
    notes: {
        type: String
    }
});

const tripSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    collaborators: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['editor', 'viewer'],
            default: 'editor'
        }
    }],
    shareToken: {
        type: String,
        unique: true,
        sparse: true
    },
    name: {
        type: String,
        required: true
    },
    timeConstraint: {
        type: String
    },
    status: {
        type: String,
        enum: ['upcoming', 'active', 'completed'],
        default: 'upcoming'
    },
    places: [placeSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to ensure owner is set to user if not provided
tripSchema.pre('save', function (next) {
    if (!this.owner && this.user) {
        this.owner = this.user;
    }
    next();
});

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
