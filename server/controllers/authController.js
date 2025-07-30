import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Admin from "../models/Admin.js";
import dotenv from "dotenv";
import logger from "../utils/logger.js";
import sendEmail from "../utils/SendEmail.js";
import { generateResetPasswordEmail } from "../utils/emailTemplates.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Register Controller (Student or Teacher)
export const register = async (req, res) => {
  const { name, email, password, role, department, subject } = req.body;

  try {
    const existingUser =
      role === "student"
        ? await Student.findOne({ email })
        : await Teacher.findOne({ email });

    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;
    if (role === "student") {
      newUser = new Student({ name, email, password: hashedPassword });
    } else if (role === "teacher") {
      newUser = new Teacher({
        name,
        email,
        password: hashedPassword,
        department,
        subject,
      });
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    await newUser.save();
    logger.info(`REGISTER: ${role} - ${email}`);
    res.status(201).json({ message: `${role} registered successfully` });
  } catch (error) {
    logger.error(`REGISTER FAILED: ${role} - ${email} - ${error.message}`);
    res.status(500).json({ message: "Registration failed", error });
  }
};

// Login Controller
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check both collections simultaneously
    const [studentResult, teacherResult, adminResult] =
      await Promise.allSettled([
        Student.findOne({ email }),
        Teacher.findOne({ email }),
        Admin.findOne({ email }),
      ]);

    let user;
    let role;
    let UserModel;

    if (studentResult.status === "fulfilled" && studentResult.value) {
      user = studentResult.value;
      role = "student";
      UserModel = Student;
    } else if (teacherResult.status === "fulfilled" && teacherResult.value) {
      user = teacherResult.value;
      role = "teacher";
      UserModel = Teacher;
    } else if (adminResult.status === "fulfilled" && adminResult.value) {
      user = adminResult.value;
      role = "admin";
      UserModel = Admin;
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect password" });

    // UPDATE LAST LOGIN
    try {
      await UserModel.findByIdAndUpdate(user._id, {
        lastLogin: new Date(),
      });
      console.log(`✅ Updated lastLogin for ${role}:`, email);
    } catch (updateError) {
      console.error("⚠️ Failed to update lastLogin:", updateError);
    }

    const token = jwt.sign({ id: user._id, role }, JWT_SECRET, {
      expiresIn: "1d",
    });
    // Prepare response data based on role
    let responseData = {
      success: true,
      token,
      role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role,
      },
      message: "Login successful",
    };

    // Add role-specific data
    if (role === "student") {
      responseData.user.isApproved = user.isApproved;
    } else if (role === "teacher") {
      responseData.user.subject = user.subject;
      responseData.user.department = user.department;
    }

    logger.info(`LOGIN SUCCESS: ${role} - ${email}`);
    res.json(responseData);
  } catch (error) {
    logger.error(`LOGIN FAILED: ${role} - ${email} - ${error.message}`);
    res.status(500).json({ message: "Login failed", error });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user across all collections
    const [studentResult, teacherResult, adminResult] =
      await Promise.allSettled([
        Student.findOne({ email }),
        Teacher.findOne({ email }),
        Admin.findOne({ email }),
      ]);

    let user = null;
    let userModel = null;

    if (studentResult.status === "fulfilled" && studentResult.value) {
      user = studentResult.value;
      userModel = "student";
    } else if (teacherResult.status === "fulfilled" && teacherResult.value) {
      user = teacherResult.value;
      userModel = "teacher";
    } else if (adminResult.status === "fulfilled" && adminResult.value) {
      user = adminResult.value;
      userModel = "admin";
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Create reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    // Send email
    await sendEmail(
      user.email,
      "Reset Your Password - EduConnect",
      `Click this link to reset your password: ${resetLink}`,
      generateResetPasswordEmail(resetLink, user.name)
    );

    logger.info(`Password reset requested for: ${userModel} - ${email}`);
    res.status(200).json({ message: "Reset link sent to your email." });
  } catch (err) {
    logger.error(`Forgot password failed for ${email}: ${err.message}`);
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const { newPassword } = req.body;

    // Find user with valid token across all collections
    const [studentResult, teacherResult, adminResult] =
      await Promise.allSettled([
        Student.findOne({
          resetToken: token,
          resetTokenExpiry: { $gt: Date.now() },
        }),
        Teacher.findOne({
          resetToken: token,
          resetTokenExpiry: { $gt: Date.now() },
        }),
        Admin.findOne({
          resetToken: token,
          resetTokenExpiry: { $gt: Date.now() },
        }),
      ]);

    let user = null;
    let userModel = null;

    if (studentResult.status === "fulfilled" && studentResult.value) {
      user = studentResult.value;
      userModel = "student";
    } else if (teacherResult.status === "fulfilled" && teacherResult.value) {
      user = teacherResult.value;
      userModel = "teacher";
    } else if (adminResult.status === "fulfilled" && adminResult.value) {
      user = adminResult.value;
      userModel = "admin";
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    logger.info(`Password reset successful for: ${userModel} - ${user.email}`);
    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    logger.error(`Password reset failed: ${err.message}`);
    res.status(500).json({ message: "Server error" });
  }
};
