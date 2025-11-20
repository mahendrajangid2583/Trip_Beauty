import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy } from 'passport-jwt';
import User from '../models/User.js';
// bcrypt is not needed here anymore

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.token;
  }
  return token;
};

export default function (passport) {
  // --- 1. Google OAuth Strategy ---
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        const googleUser = {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          isEmailVerified: true, // Google verifies emails
        };

        try {
          // 1. Check if user already exists via Google ID
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            return done(null, user);
          }

          // 2. Check if user exists via email (i.e., local account)
          user = await User.findOne({ email: profile.emails[0].value });
          if (user && (user.authProvider=='email' && !user.isEmailVerified)) {
            // 3. Link Google account
            user.authProvider='google';
            user.googleId = profile.id;
            user.isEmailVerified = true; // Mark as verified
            await user.save();
            return done(null, user);
          }else if(user && user.authProvider=='email' && user.isEmailVerified){
            //send an error that email already exits and login with email and password
            return done(new Error('Email already registered. Please log in using your email and password.'), null);
          }

          // 4. Create new Google user
          user = await User.create(googleUser);
          return done(null, user);
        } catch (err) {
          console.error(err);
          return done(err, null);
        }
      }
    )
  );

  // --- 2. JWT Strategy (for protecting routes) ---
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: cookieExtractor,
        secretOrKey: process.env.JWT_SECRET,
      },
      async (jwt_payload, done) => {
        try {
          const user = await User.findById(jwt_payload.id);
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
  
  // We are not using passport-local middleware, so its config is removed.
};