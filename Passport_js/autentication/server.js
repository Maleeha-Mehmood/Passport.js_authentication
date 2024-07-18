const express = require("express");
const path = require("path");
const app = express();
const { connectMongoose, User } = require("./database");
const ejs = require("ejs");
const passport = require("passport");
const { initializingPassport, isAuthenticated } = require("./passportConfig");
const expressSession = require("express-session");

// Connect to MongoDB
connectMongoose();

// Initialize Passport configuration
initializingPassport(passport);

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure express-session middleware
app.use(expressSession({
    secret: "long_random_string_here", // Replace with a long, randomly generated string
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// Set EJS as the view engine
app.set("view engine", "ejs");

// Serve static files from the "views" directory
app.use(express.static(path.join(__dirname, "views")));

// Routes
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/register", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (user) return res.status(400).send("User already exists!");

        const newUser = await User.create(req.body);
        res.status(201).send(newUser);
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send("Error registering user.");
    }
});

app.post("/login", passport.authenticate("local", {
    failureRedirect: "/register", // Redirect to /register on authentication failure
    successRedirect: "/"   // Redirect to "/" (index) on successful login
}));

app.get("/profile", isAuthenticated, (req, res) => {
    res.send(req.user); // Display user information after successful authentication
});

app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.send("logged out");
    });
});

// Start the server
app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
