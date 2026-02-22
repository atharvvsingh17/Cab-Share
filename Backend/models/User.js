const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: null,
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: "",
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    currentLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      address: { type: String, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);