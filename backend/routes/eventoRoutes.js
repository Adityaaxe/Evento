const express = require("express");
const router = express.Router();
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
const {validateEntry} = require('../controllers/validateQRController');
const { getUserDetails } = require('../controllers/userController');
const { createOrder } = require("../controllers/paymentController");

// Middleware to log all requests (for debugging)
router.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.path}`);
  next();
});

// Create a new event
router.post("/events", upload.single('poster'), createEvent);

// Get all events
router.get("/events", getEvents);

// Get single event by ID
router.get("/events/:id", getEventById);

// Register for an event
router.post('/events/:id/register', registerForEvent);

// Cancel registration for an event
router.post('/events/:id/cancel', cancelRegistration);

// Delete an event
router.delete("/events/:id", deleteEvent);

// Validate QR code
router.post("/validate-entry", validateEntry);

// Get user details
router.get('/users/:id', getUserDetails);

// Create Razorpay order
router.post("/payment/create-order", createOrder);

module.exports = router;
