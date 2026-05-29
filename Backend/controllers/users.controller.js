const User = require("../models/users.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const dotenv = require("dotenv");
dotenv.config();

const registerUser = async (req, res) => {
  if (!validationResult(req).isEmpty()) {
    return res.status(400).json({ errors: validationResult(req).array() });
  }

  const { name, phone, email, password, address } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      if (existingUser.email === email)
        return res.status(400).json({ error: "Email already exists" });

      if (existingUser.phone === phone)
        return res.status(400).json({ error: "Phone number already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      phone,
      email,
      password: hashedPassword,
      address
      // role automatically becomes 'user'
    });

    return res.status(201).json({ message: "User created successfully" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


const loginUser = async (req, res) => {
  if (!validationResult(req).isEmpty()) {
    return res.status(400).json({ errors: validationResult(req).array() });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: "Invalid Email or Password" });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ errors: "Invalid Email or  Password" });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" },
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure:false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    console.log("User logged in successfully:", user._id);
    return res
      .status(200)
      .json({
        user: { id: user._id, name: user.name, email: user.email, role:user.role },
      });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res
      .status(500)
      .json({ errors: "Server error, please try again later" });
  }
};

const getUserProfile = async (req, res) => {
  res.status(200).json({ user: req.user });
}

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, email, phone, address });
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};
const logoutUser = async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: "User logged out successfully" });
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  logoutUser,
};
