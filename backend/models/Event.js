const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // e.g., "3:00 PM - 5:00 PM"
  location: { type: String, required: true },
  organizerID: { type: String , ref: "User", required: true }, // Reference to the organizer
  participants: [{ type: String , ref: "User" }], // Array of user IDs who registered
  poster: { type: String }, // Path to the poster image
  registrationDeadline: { type: Date, required: true }, // Deadline for event registration
  ticketPrice: {
    type: Number,
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model("Event", eventSchema, "events");

module.exports = Event;