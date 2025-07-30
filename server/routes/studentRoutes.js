import express from "express";
import {
  getAllTeachers,
  bookAppointment,
  getMyAppointments,
  getStudentStats,
  getStudentProfile,
  updateStudentProfile,
  updateStudentProfilePicture,
  rateTeacher,
  getStudentRating,
  getTeacherAvailableSlots,
} from "../controllers/studentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { uploadProfilePicture } from "../config/cloudinary.js";

const router = express.Router();

// Public route
router.get("/teachers", getAllTeachers);

// Book appointment (student only)
router.post(
  "/book",
  authMiddleware,
  roleMiddleware(["student"]),
  bookAppointment
);
// Get available slots for a specific teacher (student only)
router.get(
  "/teacher/:teacherId/slots",
  authMiddleware,
  roleMiddleware(["student"]),
  getTeacherAvailableSlots
);

// View appointments (student only)
router.get(
  "/appointments",
  authMiddleware,
  roleMiddleware(["student"]),
  getMyAppointments
);

// Get student statistics (student only)
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware(["student"]),
  getStudentStats
);

// Profile routes
router.get(
  "/profile",
  authMiddleware,
  roleMiddleware(["student"]),
  getStudentProfile
);

router.put(
  "/profile",
  authMiddleware,
  roleMiddleware(["student"]),
  updateStudentProfile
);

router.post(
  "/profile/picture",
  authMiddleware,
  roleMiddleware(["student"]),
  uploadProfilePicture.single('profilePicture'),
  updateStudentProfilePicture
);

// Rate teacher
router.post(
  "/rate-teacher",
  authMiddleware,
  roleMiddleware(["student"]),
  rateTeacher
);
// Get student's existing rating for a teacher
router.get(
  "/rating/:teacherId",
  authMiddleware,
  roleMiddleware(["student"]),
  getStudentRating
);
export default router;
