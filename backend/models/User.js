import mongoose from 'mongoose';
import crypto from 'crypto'; // Import crypto for generating random handle

const userSchema = new mongoose.Schema(
  {
    // --- Core Identity Fields ---
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Password is NOT required, as a user might sign in via Google
    password: {
      type: String,
      // select: false, // Don't return password in queries by default
    },
    // Tracks how the user signed up
    authProvider: {
      type: String,
      enum: ['email', 'google'],
      default: 'email',
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },

    // --- Profile Fields (All Optional) ---
    name: {
      type: String,
      trim: true,
      default: null, // Explicitly set to null if not provided
    },
    // Handle must be 'sparse' if it's unique but not required.
    // This enforces uniqueness ONLY for documents that have this field.
    handle: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      sparse: true,
      // Default function to generate a random handle
      default: () => `user_${crypto.randomBytes(4).toString('hex')}`,
    },
    gender: {
      type: Boolean, // 0: female and 1: male
      default: null, // Explicitly set to null if not provided
    },
    dob: {
      type: Date,
      default: null, // Explicitly set to null if not provided
    },
    profilePic: {
      // We wrap the object in a 'type' property to allow setting a default
      type: {
        url: { type: String },
        public_id: { type: String }, // for cloudinary
      },
      default: null, // Explicitly set to null if not provided
    },

    // --- Account Status & Subscription ---
    // proAccount field has been removed.
    // This is now the single source of truth for account level.
    subscriptionStatus: {
      type: String,
      enum: ['normal', 'premium', 'travel_pro'],
      default: 'normal',
    },

    // --- Fields for Email Verification (for 'email' provider only) ---
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // Token/OTP sent to the user's email
    emailVerificationToken: {
      type: String,
      // select: false, // Hide from default queries
    },
    // Expiry time for the token
    emailVerificationTokenExpiry: {
      type: Date,
      // select: false, // Hide from default queries
    },
    // --- Bookmarks ---
    bookmarks: [{
      id: { type: String }, // External ID (e.g., from Geoapify or Wiki)
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      image: { type: String },
      description: { type: String },
      source: { type: String, enum: ['wikipedia', 'geoapify', 'manual'], default: 'manual' },
      addedAt: { type: Date, default: Date.now }
    }],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;