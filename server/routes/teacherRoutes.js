import express from "express";
import {
  updateAvailability,
  getAppointments,
  updateAppointmentStatus,
  getTeacherProfile,
  updateTeacherProfile,
  updateTeacherProfilePicture,
  getTeacherStats,
  getTeacherRatings,
  deleteAvailabilitySlot,
  getTeacherAvailability,
  deleteTeacherProfilePicture,
} from "../controllers/teacherController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { uploadProfilePicture } from "../config/cloudinary.js";

const router = express.Router();

// Set or update availability
router.post(
  "/availability",
  authMiddleware,
  roleMiddleware(["teacher"]),
  updateAvailability
);

// Get all appointments for teacher
router.get(
  "/appointments",
  authMiddleware,
  roleMiddleware(["teacher"]),
  getAppointments
);

// Approve or cancel appointment
router.put(
  "/appointments/:id",
  authMiddleware,
  roleMiddleware(["teacher"]),
  updateAppointmentStatus
);

// Get teacher dashboard statistics
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware(["teacher"]),
  getTeacherStats
);

// Profile routes
router.get(
  "/profile",
  authMiddleware,
  roleMiddleware(["teacher"]),
  getTeacherProfile
);

router.put(
  "/profile",
  authMiddleware,
  roleMiddleware(["teacher"]),
  updateTeacherProfile
);

router.post(
  "/profile/picture",
  authMiddleware,
  roleMiddleware(["teacher"]),
  uploadProfilePicture.single('profilePicture'),
  updateTeacherProfilePicture
);

router.delete(
  "/profile/picture",
  authMiddleware,
  roleMiddleware(["teacher"]),
  deleteTeacherProfilePicture
);

// Get teacher ratings
router.get(
  "/ratings",
  authMiddleware,
  roleMiddleware(["teacher"]),
  getTeacherRatings
);

// Get any teacher's ratings (public)
router.get(
  "/ratings/:teacherId",
  getTeacherRatings
);

router.get(
  "/availability",
  authMiddleware,
  roleMiddleware(["teacher"]),
  getTeacherAvailability
);

// Delete specific availability slot
router.delete(
  "/availability",
  authMiddleware,
  roleMiddleware(["teacher"]),
  deleteAvailabilitySlot
);
export default router;
