import React, { useState, useEffect } from "react";
import axios from "axios";
import jsQR from "jsqr/dist/jsQR";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

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
    poster: null, // New field for poster
    registrationDeadline: "", // New field for registration deadline
    organizerID: organizerID
  });

  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [qrResult, setQrResult] = useState("");
  const [parsedQrData, setParsedQrData] = useState(null);
  const [validationStatus, setValidationStatus] = useState(null); // null, 'success', 'error'
  const [validationMessage, setValidationMessage] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(null);


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
    // Handle file input separately
    if (e.target.name === "poster") {
      setEventData({ ...eventData, poster: e.target.files[0] });
    } else {
      setEventData({ ...eventData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Log all event data before submission
    console.log("Submitting Event Data:", {
      ...eventData,
      poster: eventData.poster ? "File Selected" : "No File"
    });

    try {
      const formData = new FormData();

      // Append all fields, ensuring they are not undefined
      Object.keys(eventData).forEach(key => {
        if (key !== 'poster' && eventData[key] !== undefined && eventData[key] !== null) {
          formData.append(key, eventData[key]);
        }
      });

      // Handle poster file separately
      if (eventData.poster) {
        formData.append('poster', eventData.poster);
      }

      // Log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await axios.post("http://localhost:5000/api/events", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("Event created successfully:", response.data);

      // Reset form after successful submission
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
      console.error("Full error details:", error);

      if (error.response) {
        // Server responded with an error
        const errorMessage = error.response.data.message ||
          error.response.data.error ||
          'Server returned an error';
        setError(errorMessage);
        console.log("Detailed error response:", error.response.data);
      } else if (error.request) {
        // Request made but no response received
        setError("No response from server. Please check your network connection.");
      } else {
        // Error in setting up the request
        setError("Error submitting form. Please try again.");
      }
    }
  };

  const openCamera = async (eventId) => {
    try {
      setSelectedEventId(eventId);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },  // Add resolution constraints
          height: { ideal: 720 }
        },
      });

      setStream(mediaStream);
      setCameraActive(true);

      // Wait for video element to be ready
      await new Promise(resolve => setTimeout(resolve, 100));

      const videoElement = document.getElementById("camera-feed");
      videoElement.srcObject = mediaStream;

      // Start scanning only after video is playing
      videoElement.onplaying = () => {
        console.log("Video is playing - starting scan");
        scanQRCode();
      };

      // Reset states
      setQrResult("");
      setParsedQrData(null);
      setValidationStatus(null);
      setValidationMessage("");

    } catch (error) {
      console.error("Camera access error:", error);
      alert(`Camera error: ${error.message}`);
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  const scanQRCode = () => {
    const videoElement = document.getElementById("camera-feed");
    if (!videoElement || videoElement.readyState !== 4) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    let scanning = true; // Control variable for the scan loop

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
          scanning = false; // Stop scanning

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
        console.error("Scanning error:", error);
        scanning = false;
      }
    };

    // Start the scan loop
    scanFrame();

    // Cleanup function
    return () => {
      scanning = false;
    };
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
      const response = await axios.post("http://localhost:5000/api/validate-entry", {
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
      {cameraActive && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
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