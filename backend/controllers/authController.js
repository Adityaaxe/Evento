const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password, isOrganizer } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashedPassword,
      isOrganizer: isOrganizer === "true" || isOrganizer === true, // ✅ Convert properly
    });

    await user.save();

    const token = jwt.sign({ id: user._id, isOrganizer: user.isOrganizer }, "your_jwt_secret", {
      expiresIn: "1d",
    });

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Validate password
    if (password !== user.password) return res.status(400).json({ message: "Invalid credentials" });

    // Send response without token
    res.status(200).json({ user: { name: user.name, email: user.email, isOrganizer: user.isOrganizer } });

  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

