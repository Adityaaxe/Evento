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

router.post('/events/:id/register', registerForEvent);
router.post('/events/:id/cancel', cancelRegistration);

router.delete("/events/:id", deleteEvent);

router.post("/validate-entry", validateEntry);

module.exports = router;
