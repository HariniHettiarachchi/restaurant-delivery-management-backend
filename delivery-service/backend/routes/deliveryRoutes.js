const express = require("express");
const {
  createDelivery,
  assignDriver,
  markAsDelivered,
  getAllDeliveries,
  updateDeliveryStatus,
} = require("../controllers/deliveryController");
const authMiddleware = require("../middlewares/authMiddleware");
const Delivery = require("../models/Delivery");

const router = express.Router();

// Create a new delivery
router.post("/", authMiddleware, createDelivery);

// Assign a driver to a delivery
router.put("/assign", authMiddleware, assignDriver);

// Mark a delivery as delivered
router.put("/deliver", authMiddleware, markAsDelivered);

// Get all deliveries
router.get("/", authMiddleware, getAllDeliveries);

// Update delivery status by driver
router.put("/status", authMiddleware, updateDeliveryStatus);

// Get active orders for a specific driver (only Assigned and In Progress)
router.get("/driver/:driverId", authMiddleware, async (req, res) => {
  try {
    const orders = await Delivery.find({ 
      driver: req.params.driverId,
      status: { $in: ["Assigned", "On the Way"] }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching orders" });
  }
});

// Get ALL orders for a specific driver (including completed ones)
router.get("/driver/:driverId/all", authMiddleware, async (req, res) => {
  try {
    const orders = await Delivery.find({ 
      driver: req.params.driverId
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching orders" });
  }
});

module.exports = router;
