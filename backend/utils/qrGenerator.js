// backend/utils/qrGenerator.js
const QRCode = require("qrcode");

exports.generateQR = async (text) => {
  try {
    const qrData = await QRCode.toDataURL(text);
    return qrData;
  } catch (err) {
    console.error("QR Error:", err);
    return null;
  }
};
