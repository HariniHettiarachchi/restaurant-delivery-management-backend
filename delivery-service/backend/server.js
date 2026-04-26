require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const deliveryRoutes = require("./routes/deliveryRoutes");
const driverRoutes = require("./routes/driverRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Health check (needed for Railway)
app.get("/api/test", (req, res) => {
  res.send("OK");
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Routes
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/drivers", driverRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Delivery Management Service is running...");
});

// IMPORTANT FIX FOR RAILWAY
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});