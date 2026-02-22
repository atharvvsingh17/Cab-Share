const User = require("../models/User");
const generateOtp = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const user = new User({
      name,
      email,
      phone: phone || null,
      otp,
      otpExpires,
    });

    await user.save();
    await sendEmail(email, "Verify your CabShare account", `Your OTP is: ${otp}`);

    res.status(201).json({ message: "Registered! OTP sent to email 🚀" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
};


const login = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found. Please register first." });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendEmail(email, "Your CabShare Login OTP", `Your OTP is: ${otp}`);

    res.json({ message: "OTP sent to your email 🚀" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "Server configuration error" });
    }


    user.otp = null;
    user.otpExpires = null;
    user.isVerified = true;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful 🚀",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        bio: user.bio,
      },
    });
  } catch (err) {
    console.error("VerifyOtp error:", err);
    res.status(500).json({ error: err.message });
  }
};


const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-otp -otpExpires");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, profilePhoto, currentLocation } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (profilePhoto) user.profilePhoto = profilePhoto;
    if (currentLocation) user.currentLocation = currentLocation;

    await user.save();

    res.json({ message: "Profile updated 🚀", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, verifyOtp, getProfile, updateProfile };