import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { validationResult } from 'express-validator';
import sendEmail from '../utils/sendEmail.js';
import calage from '../utils/age.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs'; // To delete the local file after upload

// --- Helper: Send Token ---
const sendTokenResponse = (user, statusCode, res, isGoogleCallback = false) => {
  const payload = { id: user._id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    secure: false,
    sameSite: 'lax',
  };
  if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true;
      cookieOptions.sameSite = 'none';
    }
  res.cookie('token', token, cookieOptions);

  if (isGoogleCallback) {
   
    res.redirect(process.env.CLIENT_ORIGIN);
  } else {
    res.status(statusCode).json({
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        handle: updatedUser.handle,
        gender: updatedUser.gender,
        dob: updatedUser.dob,
        age:age,
        profilePic: updatedUser.profilePic, 
        isEmailVerified: updatedUser.isEmailVerified,
        subscriptionStatus: updatedUser.subscriptionStatus,
        authProvider:updatedUser.authProvider,

      },
    });
  }
};

// --- Helper: Create & Send OTP ---
// This generates, hashes, and saves the OTP, then sends the email.
const sendVerificationEmail = async (user) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  
  // Hash the OTP for secure storage
  user.emailVerificationToken = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');
    
  user.emailVerificationTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  const message = `Your email verification code is: ${otp}\n\nThis code will expire in 10 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email Address',
      message: message,
    });
   
  } catch (err) {
    console.error('Email sending failed:', err);
    // Clear tokens on failure so user can try again
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;
    await user.save();
    // Re-throw to be caught by the calling function
    throw new Error('Email could not be sent');
  }
};


// --- Controller Functions ---

// @desc    Register a new user
export const registerUser = async (req, res) => {
  //local/email
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (user && (user.authProvider=='google' || user.isEmailVerified)) {
      
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    if(user && user.authProvider=='email' && !user.isEmailVerified){
      user.password=hashedPassword;
    }else{
      user = new User({
     
      email,
      password: hashedPassword,
      isEmailVerified: false,
    });
    }
    
    
    // Send verification email
    await sendVerificationEmail(user); // This also saves the user

    res.status(201).json({ 
      message: 'Registration successful. Please check your email for a verification code.' 
    });

  } catch (err) {
    console.error(err.message);
    if (err.message === 'Email could not be sent') {
        return res.status(500).json({ message: 'Error sending verification email. Please try registering again.' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
export const loginUser = async (req, res) => {
  
  const errors = validationResult(req);
 
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
     
      return res.status(401).json({ message: 'Invalid credentials' });

    }

    // Check if account is local or Google-only
    if (!user.password) {
      return res.status(401).json({ 
        message: 'This account was created with Google. Please use Google to log in.' 
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Send a new verification email
      await sendVerificationEmail(user);
      return res.status(403).json({ 
        message: 'Your email is not verified. A new verification code has been sent to your email.',
        code: 'ACCOUNT_NOT_VERIFIED' // A code for your frontend
      });
    }

    // All checks passed, send token
    sendTokenResponse(user, 200, res);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify user email
export const verifyEmail = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      
    const { email, otp } = req.body;
    const cleanotp = otp.toString().trim();

    // Hash the incoming OTP to compare with stored hash
    const hashedOtp = crypto
        .createHash('sha256')
        .update(cleanotp)
        .digest('hex');

    const user = await User.findOne({
        email,
        emailVerificationToken: hashedOtp,
        // FIX #1: This field name must match your schema
        emailVerificationTokenExpiry: { $gt: Date.now() }, 
    });

   

    if (!user) {
       
        return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // Verification successful
    // FIX #2: This field name must match your schema
    user.isEmailVerified = true; 
    user.googleId=null;
    user.emailVerificationToken = undefined;
    // FIX #3: This field name must match your schema
    user.emailVerificationTokenExpiry = undefined; 
    
    await user.save();

    // Log the user in
    sendTokenResponse(user, 200, res);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Resend verification email
export const resendVerificationEmail = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'This email is already verified.' });
        }

        // Send a new verification email
        await sendVerificationEmail(user);

        res.status(200).json({ message: 'A new verification code has been sent to your email.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Google auth callback
export const googleCallback = (req, res) => {
  // Passport attaches authenticated user to req.user
  
  sendTokenResponse(req.user, 200, res, true);
};



export const getUserProfile = async (req, res) => { // 2. Make it async
  

  try {
    // 3. Use the ID from the middleware to fetch the user
    // req.user.id comes from your protect middleware
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4. Now you have the full user object to send
    const age=calage(user.dob);
    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        handle:user.handle,
        gender:user.gender,
        age:age,
        dob:user.dob,
        subscriptionStatus:user.subscriptionStatus,
        profilePic:user.profilePic,
        authProvider:user.authProvider,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Logout user
export const logoutUser = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(0), // 10 seconds
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

//update user details.




// @desc    Update user details (Text + Image)
// @route   PUT /api/auth/update-details
// @access  Private

export const updateUserDetails = async (req, res) => {
  try {
    const { name, gender, dob } = req.body; 

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // --- 1. Handle Text Updates Safely ---
    
    // Only update name if it's provided and not "undefined"
    if (name && name !== 'undefined' && name !== 'null') {
        user.name = name;
    }

    // Only update DOB if it's a valid string (not empty, not "undefined")
    if (dob && dob !== 'undefined' && dob !== 'null' && dob !== '') {
        user.dob = dob;
    }

    // Handle Gender (convert string 'true'/'false' to boolean)
    if (gender !== undefined && gender !== 'undefined' && gender !== 'null') {
       user.gender = gender === 'true' || gender === true; 
    }

    // --- 2. Handle Image Upload ---
    if (req.file) {
      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'trip_planner_users', 
          width: 500,
          crop: "scale"
        });

        // Clean up old image
        if (user.profilePic && user.profilePic.public_id) {
            // We wrap this in a try/catch so a delete error doesn't stop the whole update
            try {
                await cloudinary.uploader.destroy(user.profilePic.public_id);
            } catch (err) {
                console.log("Could not delete old image, skipping.");
            }
        }

        user.profilePic = {
          url: result.secure_url,
          public_id: result.public_id,
        };

        // Delete local file
        if (fs.existsSync(req.file.path)) {
             fs.unlinkSync(req.file.path);
        }

      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        return res.status(500).json({ message: 'Image upload failed' });
      }
    }

    // --- 3. Save & Return ---
    const updatedUser = await user.save();
    const age=calage(updatedUser.dob);
    res.status(200).json({
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        handle: updatedUser.handle,
        gender: updatedUser.gender,
        dob: updatedUser.dob,
        age:age,
        profilePic: updatedUser.profilePic, 
        isEmailVerified: updatedUser.isEmailVerified,
        subscriptionStatus: updatedUser.subscriptionStatus,
        authProvider:updatedUser.authProvider,
      },
      message: "Profile updated successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
// @desc    Delete user account
// @route   DELETE /api/auth/delete-account
// @access  Private
export const forgotpassword=async(req,res)=>{
  
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try{
    const { email } = req.body;
   
    const user=await User.findOne({
      email
    });
   
    if(!user || !user.isEmailVerified){
      return res.status(404).json({messange:'User not found'});
    }
    if(user.authProvider=='google'){
      return res.status(500).json({messange:'Try Google login'});
    }
    await sendVerificationEmail(user);
    res.status(201).json({message:"OTP-sent. Check your email."});
  }catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
}


export const verifyPassOtp = async (req, res) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, otp } = req.body;

    try {
        // Find user with matching email, OTP, and ensure OTP hasn't expired
        const cleanotp = otp.toString().trim();

    // Hash the incoming OTP to compare with stored hash
    const hashedOtp = crypto
        .createHash('sha256')
        .update(cleanotp)
        .digest('hex');

    const user = await User.findOne({
        email,
        emailVerificationToken: hashedOtp,
        // FIX #1: This field name must match your schema
        emailVerificationTokenExpiry: { $gt: Date.now() }, 
    });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

      
        res.status(200).json({ success: true, message: 'OTP Verified' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const resetPassword = async (req, res) => {
 
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, otp, newPassword } = req.body;

    try {
     
         const cleanotp = otp.toString().trim();

    // Hash the incoming OTP to compare with stored hash
    const hashedOtp = crypto
        .createHash('sha256')
        .update(cleanotp)
        .digest('hex');

    const user = await User.findOne({
        email,
        emailVerificationToken: hashedOtp,
        // FIX #1: This field name must match your schema
        emailVerificationTokenExpiry: { $gt: Date.now() }, 
    });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear the OTP fields so it can't be reused
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpiry = undefined;

        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
export const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Delete Profile Pic from Cloudinary (Clean up space)
    if (user.profilePic && user.profilePic.public_id) {
      try {
        await cloudinary.uploader.destroy(user.profilePic.public_id);
      } catch (err) {
        console.error("Failed to delete image from Cloudinary:", err);
        // We continue execution even if image delete fails
      }
    }

    // 2. Delete User Data
    // Note: If you have a 'Itinerary' or 'Trip' model, delete those here too:
    // await Itinerary.deleteMany({ user: user._id });
    
    await User.findByIdAndDelete(req.user.id);

    // 3. Clear the Auth Cookie (Same settings as logout)
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: false,   // ⚠️ Match your login settings
      sameSite: 'lax', // ⚠️ Match your login settings
    });

    res.status(200).json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};