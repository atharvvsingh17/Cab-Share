const mongoose = require("mongoose");

const travelPostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    from: {
      type: String,
      required: true,
      trim: true,
    },
    to: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    seatsAvailable: {
      type: Number,
      default: 1,
      min: 1,
      max: 6,
    },
    acceptedPartners: {
      type: Number,
      default: 0,
      min: 0,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalFare: {
      type: Number,
      default: 0,
      min: 0,
    },
    farePerPerson: {
      type: Number,
      default: 0,
      min: 0,
    },
    acceptedPartners: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);
travelPostSchema.index({ date: 1 });

module.exports = mongoose.model("TravelPost", travelPostSchema);