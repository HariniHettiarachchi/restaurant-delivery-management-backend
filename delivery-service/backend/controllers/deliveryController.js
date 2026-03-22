const Delivery = require("../models/Delivery");
const Driver = require("../models/driverModel");

// Helper function to find available driver
async function findAvailableDriver(city) {
  return await Driver.findOne({
    deliveryCities: city,
    isAvailable: true
  });
}

// Create a new delivery order
exports.createDelivery = async (req, res) => {
  try {
    const { 
      customerName, 
      address, 
      items, 
      customerId, 
      customerLocation,
      city, // Add city field 
      restaurantId, 
      restaurantLocation 
    } = req.body;

    // Validate request body
    if (
      !customerName || 
      !address || 
      !items || 
      !Array.isArray(items) || 
      items.length === 0 || 
      !customerId || 
      !customerLocation || 
      !city || // Validate city
      !restaurantId || 
      !restaurantLocation
    ) {
      return res.status(400).json({ error: "Invalid request data. Ensure all fields are provided." });
    }

    // Ensure req.user is populated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized. User information is missing." });
    }

    // Find available driver for the city
    const availableDriver = await findAvailableDriver(city);

    const delivery = new Delivery({
      customerName,
      address,
      items,
      customerId,
      customerLocation,
      city,
      restaurantId,
      restaurantLocation,
      createdBy: req.user.id,
      driver: availableDriver?._id,
      status: availableDriver ? "Assigned" : "Pending",
    });

    await delivery.save();

    // If driver was found, update their availability
    if (availableDriver) {
      availableDriver.isAvailable = false;
      await availableDriver.save();
    }

    res.status(201).json(delivery);
  } catch (error) {
    console.error("Error creating delivery:", error);
    res.status(500).json({ error: "Failed to create delivery" });
  }
};

// Assign a driver to a delivery
exports.assignDriver = async (req, res) => {
  try {
    const { deliveryId, driver, driverDetails, customerId, customerLocation, restaurantId, restaurantLocation } = req.body;

    const delivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      {
        driver,
        driverDetails,
        customerId,
        customerLocation,
        restaurantId,
        restaurantLocation,
        assignedBy: req.user.id, // Use authenticated user's ID
        status: "Assigned",
      },
      { new: true }
    );

    if (!delivery) return res.status(404).json({ error: "Delivery not found" });
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ error: "Failed to assign driver" });
  }
};

// Mark a delivery as delivered
exports.markAsDelivered = async (req, res) => {
  try {
    const { deliveryId } = req.body;
    const delivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      { status: "Delivered" },
      { new: true }
    );
    if (!delivery) return res.status(404).json({ error: "Delivery not found" });
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ error: "Failed to update delivery status" });
  }
};

// Update delivery status by driver
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId, status } = req.body;

    if (!["Approved", "Rejected", "On the Way", "Delivered"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Use 'Approved', 'Rejected', 'On the Way', or 'Delivered'." });
    }

    // Get the delivery first to access its details
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return res.status(404).json({ error: "Delivery not found" });
    
    // Auto-assign driver if status is changing to "Approved" and no driver assigned yet
    if (status === "Approved" && !delivery.driver) {
      // Find available driver for the city
      const availableDriver = await findAvailableDriver(delivery.city);
      
      if (availableDriver) {
        delivery.driver = availableDriver._id;
        delivery.status = "Assigned"; // Override to "Assigned" instead of "Approved"
        delivery.assignedBy = req.user.id;
        
        // Update driver availability
        availableDriver.isAvailable = false;
        await availableDriver.save();
        
        console.log(`Auto-assigned driver ${availableDriver._id} to delivery ${deliveryId}`);
      } else {
        // If no driver found, set to Approved as requested
        delivery.status = status;
        console.log(`No available driver found for city ${delivery.city}`);
      }
    } else {
      // Regular status update
      delivery.status = status;
    }
    
    await delivery.save();
    res.json(delivery);
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ error: "Failed to update delivery status" });
  }
};

// Get all deliveries
exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find();
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch deliveries" });
  }
};
