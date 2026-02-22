const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    console.log("Attempting email with:", process.env.EMAIL_USER);
    
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"CabShare 🚕" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log(`Email sent to ${to} ✅`);
  } catch (err) {
    console.error("Full email error:", err.message);
    console.error("Error code:", err.code);
    throw new Error("Failed to send email");
  }
};

module.exports = sendEmail;