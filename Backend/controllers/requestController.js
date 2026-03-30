const PartnerRequest = require("../models/PartnerRequest");
const TravelPost = require("../models/TravelPost");
const User = require("../models/User");

const sendRequest = async (req, res) => {
  try {
    const { travelPostId, message } = req.body;

    if (!travelPostId) {
      return res.status(400).json({ error: "Travel post ID is required" });
    }

    const post = await TravelPost.findById(travelPostId);
    if (!post) return res.status(404).json({ error: "Travel post not found" });
    if (!post.isActive) return res.status(400).json({ error: "This travel post is no longer active" });

    if (post.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot send a request to your own post" });
    }

    const existing = await PartnerRequest.findOne({
      from: req.user._id,
      travelPost: travelPostId,
    });
    if (existing) {
      return res.status(400).json({ error: "You already sent a request for this post" });
    }

    const request = new PartnerRequest({
      from: req.user._id,
      to: post.user,
      travelPost: travelPostId,
      message: message || "",
    });

    await request.save();

    res.status(201).json({ message: "Request sent successfully 🚀", request });
  } catch (err) {
    console.error("sendRequest error:", err);
    res.status(500).json({ error: err.message });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const request = await PartnerRequest.findById(req.params.id)
      .populate("from", "name email phone profilePhoto bio currentLocation")
      .populate("to", "name email phone profilePhoto bio currentLocation")
      .populate("travelPost");

    if (!request) return res.status(404).json({ error: "Request not found" });

    if (request.to._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to accept this request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: `Request is already ${request.status}` });
    }

    request.status = "accepted";
    await request.save();

    const travelPost = await TravelPost.findById(request.travelPost._id);
    if (travelPost) {
      travelPost.acceptedPartners += 1;
      // Recalculate fare: totalFare / (poster + acceptedPartners)
      const totalPeople = 1 + travelPost.acceptedPartners;
      travelPost.farePerPerson = travelPost.totalFare > 0 ? Math.round(travelPost.totalFare / totalPeople) : 0;
      await travelPost.save();
    }

    const sharedDetails = {
      yourPartner: {
        name: request.from.name,
        email: request.from.email,
        phone: request.from.phone,
        profilePhoto: request.from.profilePhoto,
        bio: request.from.bio,
        currentLocation: request.from.currentLocation,
      },
      you: {
        name: request.to.name,
        email: request.to.email,
        phone: request.to.phone,
        profilePhoto: request.to.profilePhoto,
        bio: request.to.bio,
        currentLocation: request.to.currentLocation,
      },
      travelPost: request.travelPost,
    };

    res.json({
      message: "Request accepted! Contact details shared 🚀",
      sharedDetails,
    });
  } catch (err) {
    console.error("acceptRequest error:", err);
    res.status(500).json({ error: err.message });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const request = await PartnerRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ error: "Request not found" });

    if (request.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to reject this request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: `Request is already ${request.status}` });
    }

    request.status = "rejected";
    await request.save();

    res.json({ message: "Request rejected" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getReceivedRequests = async (req, res) => {
  try {
    const requests = await PartnerRequest.find({ to: req.user._id })
      .populate("from", "name email phone profilePhoto bio currentLocation")
      .populate("travelPost")
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getSentRequests = async (req, res) => {
  try {
    const requests = await PartnerRequest.find({ from: req.user._id })
      .populate("to", "name email phone profilePhoto bio currentLocation")
      .populate("travelPost")
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAcceptedPartnerDetails = async (req, res) => {
  try {
    const request = await PartnerRequest.findById(req.params.id)
      .populate("from", "name email phone profilePhoto bio currentLocation")
      .populate("to", "name email phone profilePhoto bio currentLocation")
      .populate("travelPost");

    if (!request) return res.status(404).json({ error: "Request not found" });

    const isFromUser = request.from._id.toString() === req.user._id.toString();
    const isToUser = request.to._id.toString() === req.user._id.toString();

    if (!isFromUser && !isToUser) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (request.status !== "accepted") {
      return res.status(400).json({ error: "Request has not been accepted yet" });
    }

    const partner = isFromUser ? request.to : request.from;

    res.json({
      message: "Partner details 🚀",
      partner: {
        name: partner.name,
        email: partner.email,
        phone: partner.phone,
        profilePhoto: partner.profilePhoto,
        bio: partner.bio,
        currentLocation: partner.currentLocation,
      },
      travelPost: request.travelPost,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getReceivedRequests,
  getSentRequests,
  getAcceptedPartnerDetails,
};