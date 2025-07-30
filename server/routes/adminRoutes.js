import express from "express";
import {
  adminLogin,
  approveStudent,
  addTeacher,
  deleteTeacher,
  getUsers,
  getDashboardStats,
  getStudents,
  deleteStudent,
  getTeachers,
  approveTeacher,
} from "../controllers/adminController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/login", adminLogin);
router.put(
  "/approve/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  approveStudent
);
router.post("/teacher", authMiddleware, roleMiddleware(["admin"]), addTeacher);
router.delete(
  "/teacher/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteTeacher
);
router.get("/users", authMiddleware, roleMiddleware(["admin"]), getUsers);
// Dashboard statistics
router.get(
  "/dashboard-stats",
  authMiddleware,
  roleMiddleware(["admin"]),
  getDashboardStats
);

// Student management routes
router.get("/students", authMiddleware, roleMiddleware(["admin"]), getStudents);
router.put("/approve-student/:id", authMiddleware, roleMiddleware(["admin"]), approveStudent);
router.put("/suspend-student/:id", authMiddleware, roleMiddleware(["admin"]), approveStudent);
router.delete("/student/:id", authMiddleware, roleMiddleware(["admin"]), deleteStudent);

// Teacher management routes
router.get("/teachers", authMiddleware, roleMiddleware(["admin"]), getTeachers);
router.put("/approve-teacher/:id", authMiddleware, roleMiddleware(["admin"]), approveTeacher);
router.put("/suspend-teacher/:id", authMiddleware, roleMiddleware(["admin"]), approveTeacher);
router.delete("/teacher/:id", authMiddleware, roleMiddleware(["admin"]), deleteTeacher);



export default router;
