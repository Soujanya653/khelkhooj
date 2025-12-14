const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/User");

// ✅ Show signup form
exports.signupForm = (req, res) => {
  const role = req.query.role || ""; // <-- picks ?role=athlete or ?role=academy

  res.render("signup", {
    success_msg: req.flash("success_msg"),
    error_msg: req.flash("error_msg"),
    errors: [],
    name: "",
    email: "",
    role // passed to EJS to preselect
  });
};

// ✅ Handle signup
exports.signupUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  let errors = [];

  if (!name || !email || !password || !role) {
    errors.push({ msg: "Please fill all fields" });
  }

  if (errors.length > 0) {
    return res.render("signup", { 
      errors, 
      name, 
      email, 
      role,
      success_msg: req.flash("success_msg"),
      error_msg: req.flash("error_msg")
    });
  }

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      req.flash("error_msg", "Email already registered");
      return res.redirect("/signup");
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashed, role });
    await newUser.save();

    req.flash("success_msg", "You are now registered, please log in");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Something went wrong. Please try again.");
    res.redirect("/signup");
  }
};

// ✅ Show login form
exports.loginForm = (req, res) => {
  res.render("login", {
    email: "",
    success_msg: req.flash("success_msg"),
    error_msg: req.flash("error_msg")
  });
};

// ✅ Handle login
exports.loginUser = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
};

// ✅ Logout
exports.logoutUser = (req, res) => {
  req.logout(() => {
    req.flash("success_msg", "You are logged out");
    res.redirect("/login");
  });
};
