const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isOrganizer: { type: Boolean, default: false } // New field
});

module.exports = mongoose.model("User", userSchema, "users");
