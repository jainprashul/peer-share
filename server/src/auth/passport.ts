import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../db/models/user';
import { config } from '../constants';


// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET!,
    callbackURL: config.GOOGLE_REDIRECT_URI!,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('Received Google profile:', profile);
        let user = await User.findOne({ email: profile.emails?.[0].value });
        if (user) {
            return done(null, user);
        } else {
            const newUser = new User({
                username: profile.displayName,
                email: profile.emails?.[0].value,
                password: '' // Google OAuth users don't have a local password
            });
            await newUser.save();
            return done(null, newUser);
        }
    } catch (error) {
        return done(error);
    }
}));

// JWT Strategy
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.JWT_SECRET!,
}, async (jwtPayload, done) => {
    try {
        const user = await User.findById(jwtPayload.id);
        if (user) {
            return done(null, user); //return the user to the next middleware
        } else {
            return done(null, false); //user not found
        }
    } catch (error) {
        return done(error);
    }
}));

export default passport;