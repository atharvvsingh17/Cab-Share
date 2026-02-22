const express = require("express");
const router = express.Router();
const {
  createPost,
  searchPosts,
  getMyPosts,
  getPostById,
  deletePost,
} = require("../controllers/travelController");
const protect = require("../middleware/authMiddleware");


router.post("/", protect, createPost);              
router.get("/search", protect, searchPosts);        
router.get("/my-posts", protect, getMyPosts);       
router.get("/:id", protect, getPostById);           
router.delete("/:id", protect, deletePost);        

module.exports = router;