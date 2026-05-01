const ApiKey = require("../models/ApiKey");
const crypto = require("crypto");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// SIGNUP
exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
    });

    // 🔑 Generate API key
    const generatedKey = crypto.randomBytes(16).toString("hex");

    // 💾 Save API key linked to user
    const apiKey = await ApiKey.create({
      userId: user._id,
      key: generatedKey,
    });

    res.status(201).json({
      message: "User created",
      apiKey: generatedKey, // send key to user
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Signup error");
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Login error");
  }
};