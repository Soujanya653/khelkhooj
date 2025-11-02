// config/db.js
const mongoose = require("mongoose");

const db = async () => {
  try {
    // Connect to local MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/scoutit");
    console.log("MongoDB Connected ✅");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = db;
