import express from "express";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all teachers (for students)
router.get("/teacher/list", authMiddleware, async (req, res) => {
  try {
    const teachers = await Teacher.find({}, "name email subject department");
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch teachers" });
  }
});

// Get all students (for teachers)
router.get("/student/list", authMiddleware, async (req, res) => {
  try {
    const students = await Student.find({}, "name email");
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
});

export default router;
