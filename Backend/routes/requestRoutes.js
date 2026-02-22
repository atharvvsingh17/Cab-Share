const express = require("express");
const router = express.Router();
const {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getReceivedRequests,
  getSentRequests,
  getAcceptedPartnerDetails,
} = require("../controllers/requestController");
const protect = require("../middleware/authMiddleware");

router.post("/", protect, sendRequest);                            
router.put("/:id/accept", protect, acceptRequest);                  
router.put("/:id/reject", protect, rejectRequest);                  
router.get("/received", protect, getReceivedRequests);              
router.get("/sent", protect, getSentRequests);                      
router.get("/:id/partner-details", protect, getAcceptedPartnerDetails); 

module.exports = router;