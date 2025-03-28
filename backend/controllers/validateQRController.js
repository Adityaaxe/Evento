const Event = require("../models/Event");

// Controller function
const validateEntry = async (req, res) => {
  try {
    const { eventID, userID } = req.body;

    if (!eventID || !userID) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    const event = await Event.findById(eventID);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const isRegistered = event.participants.some(
      (participant) => participant.toString() === userID
    );
    
    return res.json({
      success: isRegistered,
      message: isRegistered ? "Welcome!" : "Not Registered",
      username: isRegistered ? "Registered User" : null,
    });
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  validateEntry
}
