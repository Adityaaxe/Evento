const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password, isOrganizer } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    user = new User({
      name,
      email,
      password: hashedPassword,
      isOrganizer: isOrganizer || false
    });

    // Save user
    await user.save();

    // Return user info without token
    res.status(201).json({ 
      user: { 
        name: user.name, 
        email: user.email, 
        isOrganizer: user.isOrganizer 
      } 
    });
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
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Return user info
    res.status(200).json({ 
      user: { 
        name: user.name, 
        email: user.email, 
        isOrganizer: user.isOrganizer 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};