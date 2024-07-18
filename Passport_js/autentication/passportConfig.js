const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt'); // Import bcrypt
const { User } = require('./database'); // Correct import

exports.initializingPassport = (passport) => {
    passport.use(new LocalStrategy(async (username, password, done) => {
        try {
            const user = await User.findOne({ username });
            if (!user) return done(null, false); // User not found

            // Validate password using bcrypt
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) return done(null, false); // Incorrect password

            // Successful login
            return done(null, user);
        } catch (error) {
            return done(error); // Handle unexpected errors
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user); // Deserialize user
        } catch (error) {
            done(error); // Handle error during deserialization
        }
    });
};

// Middleware to check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};
