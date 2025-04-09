import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import PageSetup from "../components/PageSetup";

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "upcoming", "past"

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://evento-kv9i.onrender.com/api/events");
      setEvents(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Filter events based on search term and filter option
  const filteredEvents = events.filter(event => {
    // Search filter
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());

    // Date filter
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    if (filter === "upcoming" && eventDate < today) return false;
    if (filter === "past" && eventDate >= today) return false;

    return matchesSearch;
  });

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // User registration function (placeholder, to be implemented)
  const handleRegister = async (eventId) => {
    // This would be implemented with your authentication system
    alert(`Registration functionality would be implemented here for event ID: ${eventId}`);
  };

  return (
    <PageSetup>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-center text-white mb-6">Events</h1>

            {/* Search and Filter Controls */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6 z-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search events..."
                    className="w-full p-3 border rounded-lg pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute left-3 top-3 text-gray-400">
                    {/* Search icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-lg ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  >
                    All Events
                  </button>
                  <button
                    onClick={() => setFilter("upcoming")}
                    className={`px-4 py-2 rounded-lg ${filter === "upcoming" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setFilter("past")}
                    className={`px-4 py-2 rounded-lg ${filter === "past" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                  >
                    Past Events
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* No Results */}
          {!loading && filteredEvents.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-medium text-gray-700 mb-2">No events found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                {event.poster && (
                  <img
                    src={`${event.poster}`}
                    alt={`Poster for ${event.title}`}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold">{event.title}</h3>
                <p className="text-sm text-gray-700 flex-grow">{event.description}</p>
                <div className="text-sm text-gray-600 mt-2">
                  <p>📅 {new Date(event.date).toDateString()}</p>
                  <p>🕒 {event.time}</p>
                  <p>📍 {event.location}</p>
                  <p>📅 Registration Deadline: {new Date(event.registrationDeadline).toDateString()}</p>
                  <p>👥 {event.participants ? event.participants.length : 0} Registrations</p>
                </div>

                  {/* Action Buttons - preserved functionality */}
                  <div className="flex gap-3 mt-auto">
                    <Link
                      to={`/event/${event._id}`}
                      className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg text-center hover:bg-gray-300 transition-colors"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => handleRegister(event._id)}
                      className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageSetup>
  );
};

export default HomePage;