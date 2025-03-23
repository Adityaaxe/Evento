import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminPage = () => {
  // For testing purposes, we'll use a placeholder ID
  // In a real app, you would get this from your auth context/state
  const organizerID = "65fd123456789abcdef12345"; // Replace with a valid MongoDB ObjectId
  
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    organizerID: organizerID
  });

  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events", error);
    }
  };

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      // For debugging - log what we're sending
      console.log("Submitting event data:", eventData);
      
      const response = await axios.post("http://localhost:5000/api/events", eventData);
      console.log("Event created successfully:", response.data);
      
      setEvents([...events, response.data]);
      setEventData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        organizerID: organizerID
      });
    } catch (error) {
      console.error("Error creating event", error);
      
      // Display more helpful error info
      if (error.response) {
        setError(`Error: ${error.response.data.message || 'Server returned an error'}`);
        console.log("Error response data:", error.response.data);
      } else {
        setError("Error submitting form. Please try again.");
      }
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-gray-900 to-black p-4">
      {/* Left Side: Event Form */}
      <div className="w-1/3 p-4 bg-gray-200 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Host an Event</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="title"
            value={eventData.title}
            onChange={handleChange}
            placeholder="Event Title"
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            name="description"
            value={eventData.description}
            onChange={handleChange}
            placeholder="Event Description"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="date"
            name="date"
            value={eventData.date}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="time"
            name="time"
            value={eventData.time}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="location"
            value={eventData.location}
            onChange={handleChange}
            placeholder="Event Location"
            className="w-full p-2 border rounded"
            required
          />
          <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
            Create Event
          </button>
        </form>
      </div>

      {/* Right Side: Event List */}
      <div className="w-2/3 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Your Hosted Events</h2>
        <div className="space-y-3">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event._id} className="p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-bold">{event.title}</h3>
                <p>{event.description}</p>
                <p className="text-sm text-gray-600">📅 {new Date(event.date).toDateString()}</p>
                <p className="text-sm text-gray-600">🕒 {event.time}</p>
                <p className="text-sm text-gray-600">📍 {event.location}</p>
                <p className="text-sm text-gray-600">
                  👥 {event.participants ? event.participants.length : 0} Registrations
                </p>
              </div>
            ))
          ) : (
            <p>No events found. Create your first event!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;