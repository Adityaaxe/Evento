const express = require("express");
const { register, login } = require("../controllers/authController");
const { createEvent, getEvents, getEventById } = require('../controllers/eventController');
const { registerForEvent, cancelRegistration } = require('../controllers/eventController');
const User = require("../models/User"); 

const router = express.Router();

// Register user route
router.post("/register", async (req, res) => {
  try {
    console.log("Received data:", req.body);
    
    const { name, email, password, isOrganizer } = req.body;
    
    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }
    
    const newUser = new User({ 
      name, 
      email, 
      password,
      isOrganizer // Include the isOrganizer field
    });
    
    await newUser.save(); // ✅ Save user to MongoDB
    
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", login);

// Create a new event
router.post("/events", createEvent);

// Get all events
router.get("/events", getEvents);

// Get single event by ID
router.get("/events/:id", getEventById);

router.post('/events/:id/register', registerForEvent);
router.post('/events/:id/cancel', cancelRegistration);

module.exports = router;
