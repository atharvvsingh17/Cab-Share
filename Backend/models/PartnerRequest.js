const mongoose = require("mongoose");

const partnerRequestSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    travelPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TravelPost",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

partnerRequestSchema.index({ from: 1, travelPost: 1 }, { unique: true });

module.exports = mongoose.model("PartnerRequest", partnerRequestSchema);