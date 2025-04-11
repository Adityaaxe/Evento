import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

const EventDetailPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const { user, isSignedIn } = useUser();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://evento-kv9i.onrender.com/api/events/${id}`);
        setEvent(response.data);

        if (user && response.data.participants.includes(user.id)) {
          setRegistered(true);
        }

        if (response.data.organizerID) {
          const orgRes = await axios.get(`https://evento-kv9i.onrender.com/api/users/${response.data.organizerID}`);
          setOrganizer(orgRes.data);
        }

        setError("");
      } catch (error) {
        console.error("Error fetching event details:", error);
        setError("Failed to load event details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchEventDetails();
    }
  }, [id, isSignedIn, user]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleRegister = async () => {
    if (!isSignedIn || !user) {
      alert("Please log in to register for events");
      return;
    }
  
    try {
      // 1. Create payment order
      const { data } = await axios.post("https://evento-kv9i.onrender.com/api/payment/create-order", {
        amount: event.ticketPrice,
      });
  
      // 2. Razorpay checkout options
      const options = {
        key: "TUahqBCGVgBjH9YMIDcXWPll", // Replace this with your actual Razorpay key
        amount: data.order.amount,
        currency: data.order.currency,
        name: event.title,
        description: "Event Ticket",
        order_id: data.order.id,
        handler: async function (response) {
          // 3. Payment was successful, register user for the event
          const registrationData = {
            userId: user.id,
            userName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            eventId: event._id || id,
            eventTitle: event.title,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          };
  
          try {
            const res = await axios.post(`https://evento-kv9i.onrender.com/api/events/${id}/register`, registrationData);
  
            if (res.data) {
              setEvent(res.data.event);
              setRegistered(true);
  
              if (res.data.qrCodeUrl) {
                setQrCode(res.data.qrCodeUrl);
                setShowQrModal(true);
              }
  
              alert("✅ Payment successful & registration complete!");
            }
          } catch (regErr) {
            console.error("Registration error:", regErr);
            alert("Payment successful, but registration failed. Contact support.");
          }
        },
        prefill: {
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress || "",
        },
        theme: {
          color: "#7e22ce",
        },
      };
  
      // 4. Open Razorpay modal
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("❌ Payment failed. Please try again.");
    }
  };
  

  const handleCancelRegistration = async () => {
    if (!user) {
      alert("Please log in to cancel your registration");
      return;
    }

    try {
      await axios.post(`https://evento-kv9i.onrender.com/api/events/${id}/cancel`, {
        userId: user.id
      });

      setRegistered(false);
      alert("Registration canceled successfully.");
    } catch (error) {
      console.error("Cancellation error:", error);
      alert("Failed to cancel registration. Please try again.");
    }
  };

  const downloadQrCode = () => {
    if (qrCode) {
      const link = document.createElement("a");
      link.href = qrCode;
      link.download = "QR_Code.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-fuchsia-800 to-pink-700 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative h-64">
          {event?.poster && (
            <img
              src={`https://evento-kv9i.onrender.com/${event.poster}`}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="p-6 md:p-8">
          <div className="mb-6">
            <Link to="/home" className="text-blue-600 hover:underline flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to All Events
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Event Details</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{event?.description}</p>
              </div>
              <h4 className="text-lg font-bold mt-4">For any queries contact Organizer</h4>
              {organizer && (
                <div className="flex items-start space-x-4 mt-2 bg-gray-100 p-4 rounded-lg shadow-lg">
                  <img
                    src={organizer.imageUrl}
                    alt={organizer.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-lg font-semibold">{organizer.name}</h4>
                    <p className="text-sm text-gray-600">{organizer.phoneNumber}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold mb-4">Event Information</h3>
              <h4 className="text-lg font-bold">{event?.title}</h4>
              <h4 className="text-lg font-bold">Start Time : {event?.time}</h4>
              <h4 className="text-lg font-bold">Venue : {event?.location}</h4>
              <h4 className="text-lg font-bold">Ticket Price: ₹{event?.ticketPrice}</h4>
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
                      className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancel Registration
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showQrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm">
            <h2 className="text-xl font-bold mb-4 text-center">Your QR Code</h2>
            {qrCode && <img src={qrCode} alt="QR code" className="w-full h-auto" />}
            <button onClick={downloadQrCode} className="w-full mt-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Download QR Code
            </button>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full mt-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;