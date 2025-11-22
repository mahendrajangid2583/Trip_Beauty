import { body } from 'express-validator';

export const registerValidator = [
  // body('name', 'Name is required').not().isEmpty().trim().escape(),
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
];

export const loginValidator = [
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password is required').exists(),
];

export const verifyEmailValidator = [
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('otp', 'OTP must be a 6-digit number').isNumeric().isLength({ min: 6, max: 6 }),
];

export const resendOtpValidator = [
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
];
export const resetPassValidator=[
  body('email','Please include a valid email').isEmail().normalizeEmail(),
  body('otp','OPT must be 6-digit number').isNumeric().isLength({min:6,max:6}),
  body('newPassword','Password must be 6 or more characters').isLength({min:6}),
];