// app.js
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const path = require("path");

// Configs
const db = require("./config/db");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const dashboardRouter = require("./routes/dashboard");
const staticRoutes = require("./routes/static");

// Init app
const app = express();

// Connect to MongoDB
db();

// ✅ Serve static files (images, css, js) BEFORE routes
app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

// Express Session
app.use(
  session({
    secret: "scoutit_secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Connect Flash
app.use(flash());

// Passport Config
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

// Global flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use("/", authRoutes);
app.use("/profile", profileRoutes);
app.use("/dashboard", dashboardRouter);
app.use("/", staticRoutes);


// Landing page
app.get("/", (req, res) => res.render("landing"));

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
