const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  if (!options.email) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"CabShare" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2c3e50; max-width: 600px; margin: auto; border: 1px solid #e1e4e8; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <div style="background-color: #3498db; padding: 25px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px; letter-spacing: 1px;">CabShare</h1>
        </div>
        <div style="padding: 35px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #34495e;">${options.message}</p>
          
          <div style="background-color: #f4f7f9; padding: 25px; border-radius: 8px; border-left: 5px solid #3498db; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #2980b9; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Activity Summary</h3>
            <div style="font-size: 15px; color: #2c3e50; line-height: 1.8;">
              ${options.details}
            </div>
          </div>
          
          <p style="font-size: 14px; color: #7f8c8d; margin-top: 30px;">If you did not initiate this request, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #bdc3c7; border-top: 1px solid #eee;">
          <p style="margin: 0;">&copy; 2026 CabShare Team | Raipur, India</p>
          <p style="margin: 5px 0 0;">Secure & Community-Driven Ride Sharing</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    // Removed 'Formal' from the log message below
    console.log(`✅ Email delivered to: ${options.email}`);
  } catch (error) {
    console.error("❌ Nodemailer failed:", error.message);
  }
};

module.exports = sendEmail;