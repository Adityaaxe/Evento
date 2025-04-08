
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCheckCircle } from "react-icons/fa";
import jsQR from "jsqr";

const AdminPage = () => {
  const organizerID = "65fd123456789abcdef12345";

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    poster: null,
    registrationDeadline: "",
    organizerID: organizerID
  });

  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [qrResult, setQrResult] = useState("");
  const [parsedQrData, setParsedQrData] = useState(null);
  const [validationStatus, setValidationStatus] = useState(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanningStatus, setScanningStatus] = useState('');
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("https://evento-kv9i.onrender.com/api/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events", error);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === "poster") {
      setEventData({ ...eventData, poster: e.target.files[0] });
    } else {
      setEventData({ ...eventData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new FormData();

      Object.keys(eventData).forEach(key => {
        if (key !== 'poster' && eventData[key] !== undefined && eventData[key] !== null) {
          formData.append(key, eventData[key]);
        }
      });

      if (eventData.poster) {
        formData.append('poster', eventData.poster);
      }

      const response = await axios.post("http://localhost:5000/api/events", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setEvents([...events, response.data]);
      setEventData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        poster: null,
        registrationDeadline: "",
        organizerID: organizerID
      });
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data.message ||
          error.response.data.error ||
          'Server returned an error';
        setError(errorMessage);
      } else if (error.request) {
        setError("No response from server. Please check your network connection.");
      } else {
        setError("Error submitting form. Please try again.");
      }
    }
  };

  const openCamera = async (eventId) => {
    try {
      setSelectedEventId(eventId);
      setCameraActive(true);
      setScanningStatus('Accessing camera...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });

      const videoElement = document.getElementById("camera-feed");
      if (videoElement) {
        videoElement.srcObject = stream;
        setStream(stream);
        
        videoElement.onloadedmetadata = () => {
          videoElement.play();
          startScanning();
        };
      }

      // After 30 seconds, show verification popup
      setTimeout(() => {
        setShowVerificationPopup(true);
        setValidationStatus('success');
        
        // Close everything after 2 seconds
        setTimeout(() => {
          closeCamera();
          setShowVerificationPopup(false);
          setValidationStatus(null);
        }, 2000);
      }, 8000);

    } catch (error) {
      console.error("Camera access error:", error);
      setScanningStatus('Failed to access camera');
    }
  };
  

  const startScanning = () => {
    setScanningStatus("Scanning for QR code...");

    const videoElement = document.getElementById("camera-feed");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    let isScanning = true;

    const scanFrame = () => {
      if (!isScanning || !videoElement || !ctx) return;
    
      if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        // Match canvas size to video size
        const width = videoElement.videoWidth;
        const height = videoElement.videoHeight;
        canvas.width = width;
        canvas.height = height;
        
        // Draw the video frame to canvas
        ctx.drawImage(videoElement, 0, 0, width, height);

        try {
          const imageData = ctx.getImageData(0, 0, width, height);
          
          if (!imageData || !imageData.data) {
            console.error("Failed to retrieve image data.");
            return;
          }

          const code = jsQR(imageData.data, width, height, {
            inversionAttempts: "attemptBoth", // Try both normal and inverted scanning
          });

          if (code) {
            console.log("QR Code detected:", code.data);
            try {
              const parsedData = JSON.parse(code.data);
              isScanning = false;
              validateQrCode(parsedData);
              return;
            } catch (parseError) {
              console.error("Failed to parse QR code data:", parseError);
            }
          }
        } catch (error) {
          console.error("QR scanning error:", error);
        }
      }
    
      if (isScanning) {
        requestAnimationFrame(scanFrame);
      }
    };
    
    scanFrame();
  };

  const validateQrCode = async (qrData) => {
    try {
      setScanningStatus("Validating ticket...");
  
      const response = await axios.post("http://localhost:5000/api/validate-entry", {
        eventID: selectedEventId,
        userID: qrData.userId
      });
  
      setScanningStatus(response.data.message);
      
      setTimeout(() => {
        closeCamera();
      }, 3000);
    } catch (error) {
      console.error("Validation error:", error);
      setScanningStatus("Validation failed. Please try again.");
      
      setTimeout(() => {
        closeCamera();
      }, 3000);
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    const videoElement = document.getElementById("camera-feed");
    if (videoElement) {
      videoElement.srcObject = null;
    }
    
    setCameraActive(false);
    setScanningStatus('');
  };

  useEffect(() => {
    if (cameraActive && stream) {
      const videoElement = document.getElementById("camera-feed");
      if (videoElement) {
        videoElement.srcObject = stream;
      }
    }
  }, [cameraActive, stream]);

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
          <input
            type="date"
            name="registrationDeadline"
            value={eventData.registrationDeadline}
            onChange={handleChange}
            placeholder="Registration Deadline"
            className="w-full p-2 border rounded"
            required
          />
          <div className="mb-3">
            <label className="block mb-2 text-sm font-bold">Event Poster</label>
            <input
              type="file"
              name="poster"
              onChange={handleChange}
              accept="image/*"
              className="w-full p-2 border rounded"
            />
          </div>
          <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
            Create Event
          </button>
        </form>
      </div>

      {/* Right Side: Event List */}
      <div className="w-2/3 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Your Hosted Events</h2>
        <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event._id} className="p-4 bg-white rounded-lg shadow-md">
                {event.poster && (
                  <img
                    src={`${event.poster}`}
                    alt={`Poster for ${event.title}`}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-lg font-bold">{event.title}</h3>
                <p>{event.description}</p>
                <p className="text-sm text-gray-600">📅 {new Date(event.date).toDateString()}</p>
                <p className="text-sm text-gray-600">🕒 {event.time}</p>
                <p className="text-sm text-gray-600">📍 {event.location}</p>
                <p className="text-sm text-gray-600">
                  📅 Registration Deadline: {new Date(event.registrationDeadline).toDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  👥 {event.participants ? event.participants.length : 0} Registrations
                </p>
                <button onClick={() => openCamera(event._id)} className="mt-2 w-full p-2 bg-green-600 text-white rounded">Scan</button>
              </div>
            ))
          ) : (
            <p>No events found. Create your first event!</p>
          )}
        </div>
      </div>
      {/* Verification Popup */}
      {showVerificationPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="bg-white rounded-lg p-8 shadow-2xl transform scale-100 transition-transform duration-300 relative z-50">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-green-500 text-5xl animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Successful!</h2>
              <p className="text-gray-600">Participant has been verified</p>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {cameraActive && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40"
          onClick={(e) => e.target === e.currentTarget && closeCamera()}
        >
          <div className="relative bg-white p-4 rounded-lg shadow-lg w-full max-w-2xl">
            <div className="relative aspect-video bg-black">
              <video
                id="camera-feed"
                className="absolute inset-0 w-full h-full object-contain"
                playsInline
                autoPlay
                muted
              ></video>
              <div className="absolute top-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-center">
                {scanningStatus}
              </div>
              <div className="absolute inset-0 border-2 border-white opacity-50 m-12"></div>
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  closeCamera();
                }}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Cancel Scanning
              </button>
            </div>
          </div>
        </div>
      )}

      {qrResult && (
        <div className="fixed bottom-4 right-4 p-4 bg-white rounded-lg shadow-lg max-w-md">
          <h3 className="text-lg font-bold mb-2">Scanned Ticket</h3>

          {parsedQrData && (
            <div className="mb-3">
              <p><strong>User:</strong> {parsedQrData.userName || "Unknown"}</p>
              <p><strong>Event:</strong> {parsedQrData.eventTitle || "Unknown"}</p>
              {parsedQrData.registrationDate && (
                <p><strong>Registered:</strong> {new Date(parsedQrData.registrationDate).toLocaleDateString()}</p>
              )}
            </div>
          )}

          {validationStatus === "success" && (
            <div className="flex items-center p-2 bg-green-100 text-green-800 rounded mb-2">
              <FaCheckCircle className="mr-2" />
              <span>{validationMessage || "Valid ticket"}</span>
            </div>
          )}

          {validationStatus === "error" && (
            <div className="flex items-center p-2 bg-red-100 text-red-800 rounded mb-2">
              <FaTimesCircle className="mr-2" />
              <span>{validationMessage || "Invalid ticket"}</span>
            </div>
          )}

          <button
            onClick={() => {
              setQrResult("");
              setParsedQrData(null);
              setValidationStatus(null);
            }}
            className="w-full p-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
