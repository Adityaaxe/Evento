const QRCode = require('qrcode');

const generateQRCode = async (data) => {
  try {
    // Convert the data object to a JSON string
    const dataString = JSON.stringify(data);
    
    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(dataString, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300
    });
    
    return qrCodeUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

module.exports = { generateQRCode };