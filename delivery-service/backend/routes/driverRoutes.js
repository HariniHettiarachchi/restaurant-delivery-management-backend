const express = require("express");
const { registerDriver, loginDriver, getDriverById, updateDriverCities } = require("../controllers/driverController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Route for registering a driver
router.post("/register", registerDriver);

// Route for logging in a driver
router.post("/login", loginDriver);

router.get("/:id", getDriverById);

// New route for updating cities
router.put("/:id/cities", authMiddleware, updateDriverCities);

module.exports = router;



