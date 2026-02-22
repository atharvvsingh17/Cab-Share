require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const travelRoutes = require("./routes/travelRoutes");
const requestRoutes = require("./routes/requestRoutes");

const app = express();


app.use(cors());
app.use(express.json());

// ─── MongoDB Connection ────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cabshareDB")
  .then(() => console.log("MongoDB Connected 🚀"))
  .catch((err) => console.log("MongoDB Error:", err));


app.get("/", (req, res) => res.send("CabShare Server Running 🚕"));
app.get("/api/test", (req, res) => res.json({ message: "Backend connected successfully 🚀" }));

app.use("/api/auth", authRoutes);         
app.use("/api/travel", travelRoutes);     
app.use("/api/requests", requestRoutes); 


app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong on the server" });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));