const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  address: { type: String, required: true },
  customerLocation: { type: String, required: true },
  items: [{ type: String, required: true }],
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  restaurantLocation: { type: String, required: true },
  city: { type: String, required: true }, // Add this field
  driver: { type: String, default: null },
  driverDetails: { type: Object, default: null },
  status: { type: String, enum: ["Pending", "Approved", "Assigned", "Rejected", "On the Way", "Delivered"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },
});

module.exports = mongoose.model("Delivery", deliverySchema);
