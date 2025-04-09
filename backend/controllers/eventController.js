const mongoose = require('mongoose');
const Event = require('../models/Event');
const multer = require("multer");
const path = require("path");
const { generateQRCode } = require('./qrController');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/posters/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // Unique filename
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});

// Create Event (Controller)
const createEvent = async (req, res) => {
  try {
    console.log("Received event data:", req.body);
    console.log("Received file:", req.file);
    
    const { 
      title, 
      description, 
      date, 
      time, 
      location, 
      organizerID,
      registrationDeadline 
    } = req.body;
    
    // Validate required fields
    const requiredFields = [
      { field: title, name: 'title' },
      { field: description, name: 'description' },
      { field: date, name: 'date' },
      { field: time, name: 'time' },
      { field: location, name: 'location' },
      { field: organizerID, name: 'organizerID' },
      { field: registrationDeadline, name: 'registrationDeadline' }
    ];

    const missingFields = requiredFields
      .filter(({ field }) => !field)
      .map(({ name }) => name);

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: "Event details are required", 
        missingFields: missingFields 
      });
    }
    
    // Prepare event data
    const eventData = { 
      title, 
      description, 
      date, 
      time, 
      location, 
      organizerID,
      registrationDeadline,
      participants: [] 
    };

    // Add poster path if file was uploaded
    if (req.file) {
      eventData.poster = req.file.path; // Save file path
    }
    
    const newEvent = new Event(eventData);
    
    await newEvent.save();
    
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ message: "Error creating event" });
  }
};

// Fetch All Events (Controller)
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }); // Sort by date (upcoming first)
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events" });
  }
};

// Fetch Single Event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }
    
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    res.status(200).json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Error fetching event details" });
  }
};

const registerForEvent = async (req, res) => {
  try {
    const { userId, userName, eventId, eventTitle } = req.body;
    
    // Log received data
    console.log("Registration request received:", { userId, userName, eventId, eventTitle });
    
    // Find and update event with new participant
    const event = await Event.findByIdAndUpdate(
      eventId,
      { $addToSet: { participants: userId } },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    const qrData = {
      userId,
      userName,
      eventId,
      eventTitle,
      registrationDate: new Date().toISOString()
    };

    const qrCodeUrl = await generateQRCode(qrData);

    res.json({
      event,
      qrCodeUrl
    });
   
    
  } catch (error) {
    console.error('Registration error:', error);
    // Include the actual error message to help with debugging
    res.status(500).json({ 
      message: "Registration failed", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};
  
  // Cancel Registration (optional but useful)
  const cancelRegistration = async (req, res) => {
    try {
      const { id } = req.params; // Event ID
      const { userId } = req.body; // User ID who is cancelling
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid event ID format" });
      }
      
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Valid user ID is required" });
      }
      
      // Find the event and pull the user from participants array
      const event = await Event.findByIdAndUpdate(
        id,
        { $pull: { participants: userId } },
        { new: true }
      );
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.status(200).json({ 
        message: "Registration cancelled successfully", 
        event: event 
      });
    } catch (error) {
      console.error("Error cancelling registration:", error);
      res.status(500).json({ message: "Error cancelling registration" });
    }
  };

  const deleteEvent = async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid event ID format" });
      }
      
      const deletedEvent = await Event.findByIdAndDelete(id);
      
      if (!deletedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.status(200).json({ 
        message: "Event deleted successfully", 
        event: deletedEvent 
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Error deleting event" });
    }
  };
  
  // Update existing exports
  module.exports = { 
    createEvent, 
    getEvents, 
    getEventById,
    registerForEvent,
    cancelRegistration,
    deleteEvent,
    upload
  }
