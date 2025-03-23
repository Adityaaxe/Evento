const Event = require("../models/Event");
const mongoose = require("mongoose");

// Create Event (Controller)
const createEvent = async (req, res) => {
  try {
    console.log("Received event data:", req.body);
    
    const { title, description, date, time, location, organizerID } = req.body;
    
    if (!title || !description || !date || !time || !location) {
      return res.status(400).json({ message: "Event details are required" });
    }
    
    if (!organizerID) {
      return res.status(400).json({ message: "organizerID is required" });
    }
    
    if (!mongoose.Types.ObjectId.isValid(organizerID)) {
      return res.status(400).json({ message: "Invalid organizerID format" });
    }
    
    const newEvent = new Event({ 
      title, 
      description, 
      date, 
      time, 
      location, 
      organizerID,
      participants: [] 
    });
    
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
      const { id } = req.params; // Event ID
      const { userId } = req.body; // User ID who is registering
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid event ID format" });
      }
      
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Valid user ID is required" });
      }
      
      // Find the event
      const event = await Event.findById(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if user is already registered
      if (event.participants.includes(userId)) {
        return res.status(400).json({ message: "User already registered for this event" });
      }
      
      // Add user to participants array
      event.participants.push(userId);
      await event.save();
      
      res.status(200).json({ 
        message: "Registration successful", 
        event: event 
      });
    } catch (error) {
      console.error("Error registering for event:", error);
      res.status(500).json({ message: "Error registering for event" });
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

  module.exports = { 
    createEvent, 
    getEvents, 
    getEventById,
    registerForEvent,
    cancelRegistration
  };