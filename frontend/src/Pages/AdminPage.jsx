import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCheckCircle, FaPlus, FaTimesCircle } from "react-icons/fa";
import jsQR from "jsqr";

const AdminPage = () => {
  const organizerID = "65fd123456789abcdef12345";
  const [showEventForm, setShowEventForm] = useState(false);

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
  console.log(events)

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

      const response = await axios.post("https://evento-kv9i.onrender.com/api/events", formData, {
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
      // Hide form after successful submission
      setShowEventForm(false);
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

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      setStream(mediaStream);

      const videoElement = document.getElementById("camera-feed");
      videoElement.srcObject = mediaStream;

      // Start scanning only after video is playing
      videoElement.onplaying = () => {
        console.log("Video is playing - starting scan");
        setScanning(true);
        scanQRCode();
      };

      // Reset states
      setQrResult("");
      setParsedQrData(null);
      setValidationStatus(null);
      setValidationMessage("");

    } catch (error) {
      console.error("Camera access error:", error);
      setScanningStatus('Failed to access camera');
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
    setScanning(false);
  };

  const scanQRCode = () => {
    const videoElement = document.getElementById("camera-feed");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const scanFrame = () => {
      if (!scanning || !cameraActive) return;
    
      try {
        // Set canvas dimensions to match video
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
    
        // Draw video frame to canvas
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
        // Get image data for jsQR
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
    
        if (code) {
          console.log("QR Code detected:", code.data);
          setQrResult(code.data);
          setScanning(false);
    
          try {
            const parsedData = JSON.parse(code.data);
            setParsedQrData(parsedData);
            validateQrCode(parsedData);
          } catch (e) {
            setValidationStatus("error");
            setValidationMessage("Invalid QR format");
          }
    
          closeCamera();
          return;
        }
    
        // Continue scanning
        requestAnimationFrame(scanFrame);
      } catch (error) {
        console.error("Error during scanFrame:", error);
        setScanningStatus("Error scanning QR code");
      }
    };

    scanFrame();
  };

  const validateQrCode = async (qrData) => {
    try {
      // Check if we have the necessary data
      if (!qrData.userId || !selectedEventId) {
        setValidationStatus("error");
        setValidationMessage("Invalid QR code data");
        return;
      }

      // Send validation request to backend
      const response = await axios.post("https://evento-kv9i.onrender.com/api/validate-entry", {
        eventID: selectedEventId,
        userID: qrData.userId
      });

      // Update validation status based on response
      setValidationStatus(response.data.success ? "success" : "error");
      setValidationMessage(response.data.message);

      // If successful, you might want to update the UI or do something else
      console.log("Validation response:", response.data);

    } catch (error) {
      console.error("Error validating QR code:", error);
      setValidationStatus("error");
      setValidationMessage("Error validating ticket");
    }
  };

  useEffect(() => {
    if (cameraActive && stream) {
      const videoElement = document.getElementById("camera-feed");
      if (videoElement) {
        videoElement.srcObject = stream;
      }
    }
  }, [cameraActive, stream]);

  const toggleEventForm = () => {
    setShowEventForm(!showEventForm);
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 to-black p-4 relative">
      {/* Main Content Area - Event List */}
      <div className="w-full">
        <h2 className="text-xl font-bold text-white mb-4">Your Hosted Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-lg shadow-md p-2 h-full flex flex-col"
              >
                {event.poster && (
                  <img
                    src={`${event.poster}`}
                    alt={`Poster for ${event.title}`}
                    className="w-full h-56 object-cover rounded-lg mb-4"
                    referrerPolicy="no-referrer"
                  />
                )}
                <h3 className="text-lg font-bold">{event.title}</h3>
                <p className="text-sm text-gray-700 flex-grow">{event.description}</p>
                <div className="text-sm text-gray-600 mt-2">
                  <p>📅 {new Date(event.date).toDateString()}</p>
                  <p>🕒 {event.time}</p>
                  <p>📍 {event.location}</p>
                  <p>📅 Registration Deadline: {new Date(event.registrationDeadline).toDateString()}</p>
                  <p>👥 {event.participants ? event.participants.length : 0} Registrations</p>
                </div>
                <button
                  onClick={() => openCamera(event._id)}
                  className="mt-auto w-full p-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Scan
                </button>
              </div>
            ))
          ) : (
            <p className="text-white">No events found. Create your first event!</p>
          )}
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={toggleEventForm} 
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-20"
      >
        <FaPlus className="text-2xl" />
      </button>
      
      {/* Event Form Popup */}
      {showEventForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
          <div className="bg-gray-200 rounded-lg shadow-md p-6 w-full max-w-lg mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Host an Event</h2>
              <button 
                onClick={toggleEventForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimesCircle className="text-xl" />
              </button>
            </div>

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
              <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Create Event
              </button>
            </form>
          </div>
        </div>
      )}
      
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-white p-4 rounded-lg relative">
            {/* Add a border to help with scanning */}
            <div className="absolute inset-0 border-4 border-green-500 m-8 pointer-events-none"></div>

            <video
              id="camera-feed"
              autoPlay
              playsInline
              muted
              className="w-full h-auto max-h-[70vh]"
            ></video>

            <p className="text-center my-2">Align QR code within the frame</p>

            <button
              onClick={closeCamera}
              className="mt-2 w-full p-2 bg-red-600 text-white rounded"
            >
              Close Camera
            </button>
          </div>
        </div>
      )}

      {qrResult && (
        <div className="fixed bottom-4 right-4 p-4 bg-white rounded-lg shadow-lg max-w-md z-40">
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