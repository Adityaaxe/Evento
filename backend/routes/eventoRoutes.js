const express = require("express");
const router = express.Router();
const authController = require('../controllers/authController');
const {
  createEvent,
  getEvents,
  getEventById,
  registerForEvent,
  cancelRegistration,
  deleteEvent,
  upload
} = require('../controllers/eventController');
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {validateEntry} = require('../controllers/validateQRController');

// Middleware to log all requests (for debugging)
router.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.path}`);
  next();
});

// Registration Route
router.post("/register", async (req, res) => {
  try {
    console.log("Register Route Hit - Received Data:", req.body);

    const { name, email, password, isOrganizer } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide all required fields"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email"
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isOrganizer: isOrganizer || false
    });

    // Save user to MongoDB
    await newUser.save();

    // Return user info (excluding password)
    res.status(201).json({
      user: {
        name: newUser.name,
        email: newUser.email,
        isOrganizer: newUser.isOrganizer
      },
      message: "User registered successfully!"
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      message: "Server error during registration",
      error: error.message
    });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Return user info (excluding password)
    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        isOrganizer: user.isOrganizer
      },
      message: "Login successful!"
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Server error during login",
      error: error.message
    });
  }
});

// Create a new event
router.post("/events", upload.single('poster'), createEvent);

// Get all events
router.get("/events", getEvents);

// Get single event by ID
router.get("/events/:id", getEventById);

router.post('/events/:id/register', registerForEvent);
router.post('/events/:id/cancel', cancelRegistration);

router.delete("/events/:id", deleteEvent);

router.post("/validate-entry", validateEntry);

module.exports = router;
