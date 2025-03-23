import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const EventDetailPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // In a real app, you would get the current user from your auth context/state
    // This is a placeholder for demonstration
    const getCurrentUser = () => {
      // Simulate getting user from localStorage, context, etc.
      const currentUser = {
        _id: "65fd123456789abcdef54321", // Replace with actual user ID or get from auth
        name: "John Doe"
      };
      setUser(currentUser);
      return currentUser;
    };

    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(response.data);
        
        // Check if current user is already registered
        const currentUser = getCurrentUser();
        if (response.data.participants.includes(currentUser._id)) {
          setRegistered(true);
        }
        
        setError("");
      } catch (error) {
        console.error("Error fetching event details:", error);
        setError("Failed to load event details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleRegister = async () => {
    if (!user) {
      // Redirect to login or show login modal
      alert("Please log in to register for events");
      return;
    }
    
    setRegistering(true);
    
    try {
      const response = await axios.post(`http://localhost:5000/api/events/${id}/register`, {
        userId: user._id
      });
      
      // Update the event in state with the new participant
      setEvent(response.data.event);
      setRegistered(true);
      alert("Registration successful!");
    } catch (error) {
      console.error("Registration error:", error);
      
      let errorMessage = "Registration failed. Please try again.";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!user) return;
    
    setRegistering(true);
    
    try {
      const response = await axios.post(`http://localhost:5000/api/events/${id}/cancel`, {
        userId: user._id
      });
      
      // Update the event in state with the updated participants list
      setEvent(response.data.event);
      setRegistered(false);
      alert("Registration cancelled successfully");
    } catch (error) {
      console.error("Error cancelling registration:", error);
      alert("Failed to cancel registration. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-lg max-w-lg text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <Link to="/" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg">
            Go Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-8 py-6 rounded-lg max-w-lg text-center">
          <h2 className="text-xl font-bold mb-2">Event Not Found</h2>
          <p>The event you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg">
            Go Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Event Header */}
        <div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center p-6">
          <h1 className="text-3xl font-bold text-white text-center">{event.title}</h1>
        </div>
        
        {/* Event Content */}
        <div className="p-6 md:p-8">
          {/* Navigation */}
          <div className="mb-6">
            <Link to="/home" className="text-blue-600 hover:underline flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to All Events
            </Link>
          </div>
          
          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Event Details</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{event.description}</p>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Event Information</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Date</div>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(event.date)}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 mb-1">Time</div>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{event.time}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 mb-1">Location</div>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 mb-1">Registered Attendees</div>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{event.participants ? event.participants.length : 0} people</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  {!registered ? (
                    <button 
                      onClick={handleRegister}
                      disabled={registering}
                      className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                    >
                      {registering ? "Processing..." : "Register for Event"}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-center">
                        You're registered for this event
                      </div>
                      <button 
                        onClick={handleCancelRegistration}
                        disabled={registering}
                        className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-400"
                      >
                        {registering ? "Processing..." : "Cancel Registration"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;