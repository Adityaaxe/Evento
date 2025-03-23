// In your React component
const [qrCode, setQrCode] = useState(null);

// After successful registration
const handleRegistration = async () => {
  const response = await axios.post(`/api/events/${id}/register`, {
    userId: user._id
  });
  
  // Show QR code to user
  setQrCode(response.data.qrCodeUrl);
};

// In your JSX
{qrCode && (
  <div className="mt-4">
    <h3>Your Ticket</h3>
    <img src={qrCode} alt="Event QR Code" width="200" />
    <p>Please show this QR code at the event entrance</p>
  </div>
)}