const Driver = require("../models/driverModel");
const { generateToken } = require("../utils/tokenGenerator"); // ✅ Import your token generator

const registerDriver = async (req, res) => {
  try {
    const { name, email, password, role, deliveryCities } = req.body;

    const existingDriver = await Driver.findOne({ email });
    if (existingDriver) {
      return res.status(400).json({ error: "Driver already exists." });
    }

    const driver = new Driver({ 
      name, 
      email, 
      password, 
      role,
      deliveryCities: deliveryCities || [] 
    });
    await driver.save();

    res.status(201).json({ message: "Driver registered successfully." });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if driver exists
    const driver = await Driver.findOne({ email });
    if (!driver) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Validate password
    const isMatch = await driver.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Generate token with role, userId, and email
    const token = generateToken(driver.role, driver._id, driver.email);

    // Return the token and driver details
    res.status(200).json({
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        role: driver.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    return res.status(200).json(driver);
  } catch (error) {
    return res.status(500).json({ error: "error " + error });
  }
};

const updateDriverCities = async (req, res) => {
  try {
    const { cities } = req.body;
    const driverId = req.params.id;

    if (!Array.isArray(cities)) {
      return res.status(400).json({ error: "Cities must be an array" });
    }

    const driver = await Driver.findByIdAndUpdate(
      driverId,
      { deliveryCities: cities },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.status(200).json(driver);
  } catch (error) {
    res.status(500).json({ error: "Failed to update driver cities" });
  }
};

module.exports = {
  registerDriver,
  loginDriver,
  getDriverById,
  updateDriverCities, // Add this new export
};
