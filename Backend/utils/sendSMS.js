// utils/sendSMS.js
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (phone, message) => {
  return await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE,
    to: phone
  });
};

module.exports = sendSMS;
