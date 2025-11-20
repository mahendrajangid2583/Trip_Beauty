import express from 'express';
import passport from 'passport';
import {
  registerUser,
  loginUser,
  logoutUser,
  googleCallback,
  getUserProfile,
  verifyEmail,
  resendVerificationEmail,
  updateUserDetails,
  deleteUserAccount,
  forgotpassword,
  resetPassword,
  verifyPassOtp
} from '../controllers/authController.js';
import upload from '../middlewares/uploadMiddleware.js';
import protect from '../middlewares/auth.js';
import {
  registerValidator,
  loginValidator,
  verifyEmailValidator,
  resendOtpValidator,
  resetPassValidator
} from '../middlewares/validator.js';

const router = express.Router();

// @route   POST /api/auth/register
router.post('/register', registerValidator, registerUser);

// @route   POST /api/auth/login
router.post('/login', loginValidator, loginUser);

// @route   POST /api/auth/verify-email
router.post('/verify-email', verifyEmailValidator, verifyEmail);
router.put('/update-details', protect,upload.single('profilePic'), updateUserDetails);
router.delete('/delete-account', protect, deleteUserAccount);

// @route   POST /api/auth/resend-verification
router.post('/resend-verification', resendOtpValidator, resendVerificationEmail);
router.post('/forgot-password',resendOtpValidator,forgotpassword);
router.post('/verify-pass-otp',verifyEmailValidator,verifyPassOtp);
router.post('/reset-password',resetPassValidator,resetPassword);
// @route   GET /api/auth/logout
router.get('/logout', logoutUser);

// @route   GET /api/auth/me
router.get('/me', protect, getUserProfile);

// --- Google OAuth Routes ---

// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

// @route   GET /api/auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_ORIGIN}/login`,
    session: false,
  }),
  googleCallback
);



export default router;