import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
import authRoutes from "./routes/authRoutes.js";
app.use("/api/auth", authRoutes);

import studentRoutes from "./routes/studentRoutes.js";
app.use("/api/student", studentRoutes);

import teacherRoutes from "./routes/teacherRoutes.js";
app.use("/api/teacher", teacherRoutes);

import adminRoutes from "./routes/adminRoutes.js";
app.use("/api/admin", adminRoutes);

import messageRoutes from "./routes/messageRoutes.js";
app.use("/api/message", messageRoutes);

import userRoutes from "./routes/userRoutes.js";
app.use("/api/", userRoutes);
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
