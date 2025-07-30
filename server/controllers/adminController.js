import Admin from "../models/Admin.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Appointment from "../models/Appointment.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Admin Login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: admin._id, role: "admin" }, JWT_SECRET, {
      expiresIn: "1d",
    });
    logger.info(`LOGIN SUCCESS: admin - ${email}`);
    res.json({ token, role: "admin", message: "Login successful" });
  } catch (error) {
    logger.error(`ADMIN LOGIN FAILED: ${email} - ${error.message}`);
    res.status(500).json({ message: "Login failed", error });
  }
};

// Get all students
export const getStudents = async (req, res) => {
  try {
    console.log("📚 Fetching all students...");

    const students = await Student.find().sort({ createdAt: -1 });

    // Calculate stats for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const appointments = await Appointment.find({ student: student._id });

        return {
          ...student.toObject(),
          stats: {
            totalAppointments: appointments.length,
            completedSessions: appointments.filter(
              (a) => a.status === "completed"
            ).length,
            pendingRequests: appointments.filter((a) => a.status === "pending")
              .length,
          },
        };
      })
    );

    console.log(`✅ Found ${studentsWithStats.length} students`);

    res.json({
      success: true,
      data: studentsWithStats,
    });
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching students",
      error: error.message,
    });
  }
};

// Approve student
export const approveStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const student = await Student.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      message: `Student ${isApproved ? "approved" : "suspended"} successfully`,
      data: student,
    });
  } catch (error) {
    console.error("❌ Error updating student status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating student status",
      error: error.message,
    });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete student's appointments first
    await Appointment.deleteMany({ student: id });

    // Delete the student
    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting student:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting student",
      error: error.message,
    });
  }
};

// Add Teacher
export const addTeacher = async (req, res) => {
  const { name, email, password, department, subject } = req.body;

  try {
    const exists = await Teacher.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Teacher already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const teacher = new Teacher({
      name,
      email,
      password: hashedPassword,
      department,
      subject,
    });

    await teacher.save();
    logger.info(`ADD TEACHER: admin - ${req.user.id}, teacher - ${email}`);
    res
      .status(201)
      .json({ success: true, message: "Teacher added successfully" });
  } catch (error) {
    logger.error(`ADD TEACHER FAILED: ${error.message}`);
    res.status(500).json({ message: "Add teacher failed", error });
  }
};

// Get all teachers with stats
export const getTeachers = async (req, res) => {
  try {
    console.log("👨‍🏫 Fetching all teachers...");

    const teachers = await Teacher.find().sort({ createdAt: -1 });

    // Calculate stats for each teacher
    const teachersWithStats = await Promise.all(
      teachers.map(async (teacher) => {
        const appointments = await Appointment.find({ teacher: teacher._id });
        const students = await Appointment.distinct("student", {
          teacher: teacher._id,
        });

        return {
          ...teacher.toObject(),
          stats: {
            totalStudents: students.length,
            totalSessions: appointments.filter((a) => a.status === "completed")
              .length,
            totalAppointments: appointments.length,
          },
        };
      })
    );

    console.log(`✅ Found ${teachersWithStats.length} teachers`);

    res.json({
      success: true,
      data: teachersWithStats,
    });
  } catch (error) {
    console.error("❌ Error fetching teachers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching teachers",
      error: error.message,
    });
  }
};

// Approve/Suspend teacher
export const approveTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const teacher = await Teacher.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.json({
      success: true,
      message: `Teacher ${isApproved ? "approved" : "suspended"} successfully`,
      data: teacher,
    });
  } catch (error) {
    console.error("❌ Error updating teacher status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating teacher status",
      error: error.message,
    });
  }
};

// Delete teacher
export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete teacher's appointments first
    await Appointment.deleteMany({ teacher: id });

    // Delete the teacher
    const teacher = await Teacher.findByIdAndDelete(id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting teacher:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting teacher",
      error: error.message,
    });
  }
};

// Get All Students & Teachers
export const getUsers = async (req, res) => {
  try {
    const students = await Student.find().select("-password");
    const teachers = await Teacher.find().select("-password");
    res.json({ students, teachers });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// Get Dashboard Statistics
export const getDashboardStats = async (req, res) => {
  try {
    console.log("📊 Fetching dashboard statistics...");

    // Get current date range for today
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Get current week range
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    startOfWeek.setHours(0, 0, 0, 0);

    // Get parallel data with TEACHER APPROVALS INCLUDED
    const [
      totalStudents,
      pendingStudentApprovals,
      pendingTeacherApprovals, // ← ADD THIS
      approvedStudents,
      approvedTeachers, // ← ADD THIS
      totalTeachers,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      todayAppointments,
      weeklyAppointments,
      recentStudents,
      recentTeachers, // ← ADD THIS
    ] = await Promise.all([
      // Total students count
      Student.countDocuments(),

      // Pending student approvals
      Student.countDocuments({ isApproved: false }),

      // Pending teacher approvals (ADDED)
      Teacher.countDocuments({ isApproved: false }),

      // Approved students
      Student.countDocuments({ isApproved: true }),

      // Approved teachers (ADDED)
      Teacher.countDocuments({ isApproved: true }),

      // Total teachers
      Teacher.countDocuments(),

      // Total appointments
      Appointment.countDocuments(),

      // Completed appointments
      Appointment.countDocuments({ status: "completed" }),

      // Pending appointments
      Appointment.countDocuments({ status: "pending" }),

      // Today's appointments
      Appointment.countDocuments({
        dateTime: { $gte: startOfDay, $lt: endOfDay },
      }),

      // Weekly appointments
      Appointment.countDocuments({
        dateTime: { $gte: startOfWeek, $lt: endOfDay },
      }),

      // Recent student registrations
      Student.countDocuments({
        createdAt: { $gte: startOfWeek },
      }),

      // Recent teacher registrations (ADDED)
      Teacher.countDocuments({
        createdAt: { $gte: startOfWeek },
      }),
    ]);

    // Calculate active teachers (teachers with at least one appointment)
    const activeTeachersCount = await Appointment.distinct("teacher").then(
      (teachers) => teachers.length
    );

    // CALCULATE COMBINED PENDING APPROVALS
    const totalPendingApprovals = pendingStudentApprovals + pendingTeacherApprovals;

    const stats = {
      totalStudents,
      totalTeachers,
      
      // COMBINED PENDING APPROVALS (Main metric for admin)
      pendingApprovals: totalPendingApprovals,
      
      // BREAKDOWN FOR DETAILED VIEW
      breakdown: {
        pendingStudents: pendingStudentApprovals,
        pendingTeachers: pendingTeacherApprovals,
      },
      
      approvedStudents,
      approvedTeachers, // Added approved teachers
      activeTeachers: activeTeachersCount,
      
      // Appointment metrics
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      todayAppointments,
      weeklyAppointments,
      
      // Recent activity
      recentStudents,
      recentTeachers,
      
      // Enhanced metrics
      approvalRate:
        totalStudents > 0
          ? Math.round((approvedStudents / totalStudents) * 100)
          : 0,
      
      teacherApprovalRate:
        totalTeachers > 0
          ? Math.round((approvedTeachers / totalTeachers) * 100)
          : 0,
      
      completionRate:
        totalAppointments > 0
          ? Math.round((completedAppointments / totalAppointments) * 100)
          : 0,
      
      teacherUtilization:
        totalTeachers > 0
          ? Math.round((activeTeachersCount / totalTeachers) * 100)
          : 0,
      
      avgAppointmentsPerTeacher:
        activeTeachersCount > 0
          ? Math.round(totalAppointments / activeTeachersCount)
          : 0,

      // OVERALL APPROVAL METRICS
      overallApprovalRate:
        (totalStudents + totalTeachers) > 0
          ? Math.round(((approvedStudents + approvedTeachers) / (totalStudents + totalTeachers)) * 100)
          : 0,
    };

    console.log("✅ Dashboard stats calculated:");
    console.log(`📊 Total Pending Approvals: ${totalPendingApprovals} (${pendingStudentApprovals} students + ${pendingTeacherApprovals} teachers)`);
    console.log(`👥 Students: ${totalStudents} total, ${approvedStudents} approved, ${pendingStudentApprovals} pending`);
    console.log(`👨‍🏫 Teachers: ${totalTeachers} total, ${approvedTeachers} approved, ${pendingTeacherApprovals} pending`);
    console.log(`📅 Appointments: ${totalAppointments} total, ${completedAppointments} completed, ${pendingAppointments} pending`);

    res.json({
      success: true,
      data: stats,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};

