const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { sendWelcomeEmail } = require("../config/mailer");

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      sessionVersion: user.sessionVersion || 0,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const getUserResponse = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    permissions:
      user.role === "admin"
        ? user.permissions || []
        : [],
    avatar: user.avatar,
    isActive: user.isActive,
    isVerified: user.isVerified,
    lastLogin: user.lastLogin,
  };
};

// =========================
// REGISTER
// =========================

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required.",
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        message:
          "Name must contain at least 2 characters.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : "",
      role: "customer",
      permissions: [],
      sessionVersion: 0,
    });

    sendWelcomeEmail(user).catch((error) => {
      console.error(
        "Welcome email failed:",
        error.message
      );
    });

    const token = createToken(user);

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: getUserResponse(user),
    });
  } catch (error) {
    console.error(
      "Register error:",
      error
    );

    return res.status(500).json({
      message: "Registration failed.",
    });
  }
};

// =========================
// LOGIN
// =========================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message:
          "Your account has been disabled.",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    user.lastLogin = new Date();

    await user.save();

    const token = createToken(user);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: getUserResponse(user),
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      message: "Login failed.",
    });
  }
};

module.exports = {
  register,
  login,
};