const TravelPost = require("../models/TravelPost");

const createPost = async (req, res) => {
  try {
    const { from, to, date, timeSlot, seatsAvailable, note, totalFare } = req.body;

    if (!from || !to || !date || !timeSlot) {
      return res.status(400).json({ error: "From, To, Date and TimeSlot are required" });
    }

    const travelDate = new Date(date);
    if (travelDate < new Date()) {
      return res.status(400).json({ error: "Travel date cannot be in the past" });
    }

    const seats = seatsAvailable || 1;
    const fare = totalFare || 0;

    const farePerPerson = Math.round(fare / (1 + seats));

    const post = new TravelPost({
      user: req.user._id,
      from: from.trim(),
      to: to.trim(),
      date: travelDate,
      timeSlot,
      seatsAvailable: seats,
      note: note || "",
      totalFare: fare,
      farePerPerson,
    });

    await post.save();
    await post.populate("user", "name email phone profilePhoto bio");

    res.status(201).json({ message: "Travel post created 🚀", post });
  } catch (err) {
    console.error("createPost error:", err);
    res.status(500).json({ error: err.message });
  }
};

const searchPosts = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({ error: "From, To and Date are required to search" });
    }

    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

    const posts = await TravelPost.find({
      from: { $regex: from, $options: "i" },
      to: { $regex: to, $options: "i" },
      date: { $gte: startOfDay, $lte: endOfDay },
      isActive: true,
      user: { $ne: req.user._id }, // exclude current user's own posts
    })
      .populate("user", "name email profilePhoto bio")
      .sort({ createdAt: -1 });

    res.json({ count: posts.length, posts });
  } catch (err) {
    console.error("searchPosts error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getMyPosts = async (req, res) => {
  try {
    const posts = await TravelPost.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await TravelPost.findById(req.params.id)
      .populate("user", "name email profilePhoto bio");

    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await TravelPost.findById(req.params.id);

    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this post" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createPost, searchPosts, getMyPosts, getPostById, deletePost };