import Teacher from "../models/Teacher.js";
import Appointment from "../models/Appointment.js";
import logger from "../utils/logger.js";
import { updateExpiredAppointments } from "../services/appointmentService.js";
import cloudinary from "../config/cloudinary.js";

// Update Teacher Availability (Fixed Version)
export const updateAvailability = async (req, res) => {
  const teacherId = req.user.id;
  const { slots } = req.body;

  try {
    console.log("📅 Updating availability for teacher:", teacherId);
    console.log("🕐 New slots to add:", slots);

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Debug: Log existing slots
    console.log("📋 Existing slots before update:", teacher.availableSlots);

    // Convert new slots to Date objects for comparison
    const newSlots = slots.map((slot) => new Date(slot));

    // Add new slots to existing slots (don't replace!)
    newSlots.forEach((newSlot) => {
      // Check if slot already exists (avoid duplicates)
      const alreadyExists = teacher.availableSlots.some(
        (existingSlot) => new Date(existingSlot).getTime() === newSlot.getTime()
      );

      if (!alreadyExists) {
        teacher.availableSlots.push(newSlot); // ADD to array, don't replace
      } else {
        console.log("⚠️ Slot already exists, skipping:", newSlot);
      }
    });

    // Sort slots by date (earliest first)
    teacher.availableSlots.sort((a, b) => new Date(a) - new Date(b));

    await teacher.save();

    // Debug: Log final slots
    console.log("✅ Final slots after update:", teacher.availableSlots);

    logger.info(
      `Teacher availability updated: ${teacherId} - Added ${newSlots.length} slots`
    );

    res.json({
      success: true,
      message: "Availability updated successfully",
      data: {
        totalSlots: teacher.availableSlots.length,
        newSlotsAdded: newSlots.length,
        availableSlots: teacher.availableSlots,
      },
    });
  } catch (error) {
    console.error("❌ Error updating teacher availability:", error);
    logger.error(`Failed to update teacher availability: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error updating availability",
      error: error.message,
    });
  }
};

// View Appointments
// Get Teacher Appointments with Auto-Update
export const getAppointments = async (req, res) => {
  const teacherId = req.user.id;

  try {
    console.log("📋 Fetching appointments for teacher:", teacherId);

    // Auto-update expired appointments first
    await updateExpiredAppointments();

    const appointments = await Appointment.find({ teacher: teacherId })
      .populate("student", "name email profile")
      .sort({ dateTime: -1 });

    console.log(`✅ Found ${appointments.length} appointments for teacher`);
    logger.info(`Teacher appointments fetched: ${teacherId}`);

    res.json(appointments);
  } catch (error) {
    console.error("❌ Error fetching teacher appointments:", error);
    logger.error(`Failed to fetch teacher appointments: ${error.message}`);
    res.status(500).json({
      message: "Error fetching appointments",
      error,
    });
  }
};

// Approve or Cancel Appointment
// Update Appointment Status (Enhanced to remove slot when approved)
// Update Appointment Status
export const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const teacherId = req.user.id;

  try {
    console.log("📝 Updating appointment status:", { id, status, teacherId });

    // Validate status
    if (!["approved", "canceled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved' or 'canceled'",
      });
    }

    const appointment = await Appointment.findOne({
      _id: id,
      teacher: teacherId,
    }).populate("student", "name email");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found or unauthorized",
      });
    }

    // If approving appointment, handle slot removal
    if (status === "approved" && appointment.status === "pending") {
      const teacher = await Teacher.findById(teacherId);
      if (teacher && appointment.bookingType === "slot_booking") {
        // Remove the specific time slot only for slot bookings
        const appointmentTime = new Date(appointment.dateTime);
        teacher.availableSlots = teacher.availableSlots.filter(
          (slot) => new Date(slot).getTime() !== appointmentTime.getTime()
        );
        await teacher.save();
        console.log("🗑️ Removed time slot from teacher availability");
      }
    }

    // If canceling an approved appointment, add the slot back (for slot bookings only)
    if (
      status === "canceled" &&
      appointment.status === "approved" &&
      appointment.bookingType === "slot_booking"
    ) {
      const teacher = await Teacher.findById(teacherId);
      if (teacher) {
        const appointmentTime = new Date(appointment.dateTime);
        if (appointmentTime > new Date()) {
          teacher.availableSlots.push(appointmentTime);
          teacher.availableSlots.sort((a, b) => new Date(a) - new Date(b));
          await teacher.save();
          console.log("🔄 Added time slot back to teacher availability");
        }
      }
    }

    // Update appointment status
    appointment.status = status;
    await appointment.save();

    console.log("✅ Appointment status updated successfully");

    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: appointment,
    });
  } catch (error) {
    console.error("❌ Error updating appointment status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating appointment status",
      error: error.message,
    });
  }
};

// Get Teacher Dashboard Statistics
export const getTeacherStats = async (req, res) => {
  const teacherId = req.user.id;

  try {
    console.log("📊 Fetching stats for teacher:", teacherId);

    // Get teacher with rating info
    const teacher = await Teacher.findById(teacherId).select(
      "averageRating totalRatings subject department"
    );

    // Get total appointments for this teacher
    const totalAppointments = await Appointment.countDocuments({
      teacher: teacherId,
      status: { $in: ["completed", "approved"] },
    });

    // Get pending requests
    const pendingRequests = await Appointment.countDocuments({
      teacher: teacherId,
      status: "pending",
    });

    // Get approved appointments for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const approvedToday = await Appointment.countDocuments({
      teacher: teacherId,
      status: "approved",
      dateTime: { $gte: startOfDay, $lte: endOfDay },
    });

    // Get total unique students who have appointments with this teacher
    const totalStudents = await Appointment.distinct("student", {
      teacher: teacherId,
    });

    // Calculate weekly change (last 7 days vs previous 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentAppointments = await Appointment.countDocuments({
      teacher: teacherId,
      createdAt: { $gte: sevenDaysAgo },
    });

    const previousWeekAppointments = await Appointment.countDocuments({
      teacher: teacherId,
      createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
    });

    // Calculate percentage change
    let weeklyChange = 0;
    if (previousWeekAppointments > 0) {
      weeklyChange = Math.round(
        ((recentAppointments - previousWeekAppointments) /
          previousWeekAppointments) *
          100
      );
    } else if (recentAppointments > 0) {
      weeklyChange = 100;
    }

    // Get yesterday's approved appointments for comparison
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const approvedYesterday = await Appointment.countDocuments({
      teacher: teacherId,
      status: "approved",
      dateTime: { $gte: yesterday, $lte: endOfYesterday },
    });

    // Calculate student growth (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentStudents = await Appointment.distinct("student", {
      teacher: teacherId,
      createdAt: { $gte: thirtyDaysAgo },
    });

    const previousMonthStudents = await Appointment.distinct("student", {
      teacher: teacherId,
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    });

    let studentGrowth = 0;
    if (previousMonthStudents.length > 0) {
      studentGrowth = Math.round(
        ((recentStudents.length - previousMonthStudents.length) /
          previousMonthStudents.length) *
          100
      );
    } else if (recentStudents.length > 0) {
      studentGrowth = 100;
    }

    const stats = {
      totalAppointments,
      pendingRequests,
      approvedToday,
      totalStudents: totalStudents.length,
      weeklyChange,
      approvedYesterday,
      studentGrowth,
      recentAppointments,
      recentStudentsCount: recentStudents.length,
      averageRating: teacher.averageRating || 0,
      totalRatings: teacher.totalRatings || 0,
      subject: teacher.subject || "Not specified",
      department: teacher.department || "Not specified",
    };

    console.log("✅ Teacher stats calculated:", stats);
    logger.info(`Teacher stats fetched for: ${teacherId}`);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("❌ Error fetching teacher stats:", error);
    logger.error(`Failed to fetch teacher stats: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};
// Get Teacher Ratings and Reviews
export const getTeacherRatings = async (req, res) => {
  const teacherId = req.params.teacherId || req.user.id;

  try {
    console.log("⭐ Fetching ratings for teacher:", teacherId);

    const teacher = await Teacher.findById(teacherId)
      .populate("ratings.student", "name")
      .select("ratings averageRating totalRatings name subject");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Sort ratings by most recent first
    const sortedRatings = teacher.ratings.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({
      success: true,
      data: {
        teacherName: teacher.name,
        subject: teacher.subject,
        averageRating: teacher.averageRating,
        totalRatings: teacher.totalRatings,
        ratings: sortedRatings,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching ratings:", error);
    logger.error(`Failed to fetch ratings: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching ratings",
      error: error.message,
    });
  }
};

// profile section
// Get Teacher Profile
export const getTeacherProfile = async (req, res) => {
  const teacherId = req.user.id;

  try {
    console.log("📋 Fetching profile for teacher:", teacherId);

    const teacher = await Teacher.findById(teacherId).select(
      "-password -resetToken -resetTokenExpiry"
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    console.log("✅ Teacher profile found");
    logger.info(`Teacher profile fetched: ${teacherId}`);

    res.json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    console.error("❌ Error fetching teacher profile:", error);
    logger.error(`Failed to fetch teacher profile: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// Update Teacher Profile
export const updateTeacherProfile = async (req, res) => {
  const teacherId = req.user.id;
  const updates = req.body;

  try {
    console.log("📝 Updating profile for teacher:", teacherId);
    console.log("Updates:", updates);

    // Don't allow updating sensitive fields
    const restrictedFields = [
      "password",
      "email",
      "resetToken",
      "resetTokenExpiry",
    ];
    restrictedFields.forEach((field) => delete updates[field]);

    const teacher = await Teacher.findByIdAndUpdate(
      teacherId,
      {
        ...updates,
        updatedAt: Date.now(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -resetToken -resetTokenExpiry");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    console.log("✅ Teacher profile updated");
    logger.info(`Teacher profile updated: ${teacherId}`);

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: teacher,
    });
  } catch (error) {
    console.error("❌ Error updating teacher profile:", error);
    logger.error(`Failed to update teacher profile: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// Update Teacher Profile Picture
export const updateTeacherProfilePicture = async (req, res) => {
  const teacherId = req.user.id;

  try {
    console.log("🖼️ Updating teacher profile picture:", teacherId);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Delete old profile picture from Cloudinary if exists
    if (
      teacher.profile?.profilePicture &&
      teacher.profile.profilePicture.includes("cloudinary")
    ) {
      try {
        // Extract public_id from the URL
        const urlParts = teacher.profile.profilePicture.split("/");
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = `teacher-student-system/${
          publicIdWithExtension.split(".")[0]
        }`;

        await cloudinary.uploader.destroy(publicId);
        console.log("🗑️ Old profile picture deleted from Cloudinary");
      } catch (deleteError) {
        console.log("⚠️ Could not delete old image:", deleteError.message);
      }
    }

    // Update teacher profile with new image URL
    if (!teacher.profile) {
      teacher.profile = {};
    }

    teacher.profile.profilePicture = req.file.path; // Cloudinary URL
    await teacher.save();

    console.log("✅ Teacher profile picture updated successfully");

    res.json({
      success: true,
      message: "Profile picture updated successfully",
      data: {
        profilePicture: teacher.profile.profilePicture,
        teacherId: teacher._id,
      },
    });
  } catch (error) {
    console.error("❌ Error updating profile picture:", error);

    // If file was uploaded but database update failed, clean up Cloudinary
    if (req.file?.path) {
      try {
        const urlParts = req.file.path.split("/");
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = `teacher-student-system/${
          publicIdWithExtension.split(".")[0]
        }`;
        await cloudinary.uploader.destroy(publicId);
      } catch (cleanupError) {
        console.log("⚠️ Cleanup failed:", cleanupError.message);
      }
    }

    res.status(500).json({
      success: false,
      message: "Error updating profile picture",
      error: error.message,
    });
  }
};
// Delete Teacher Profile Picture
export const deleteTeacherProfilePicture = async (req, res) => {
  const teacherId = req.user.id;

  try {
    console.log("🗑️ Deleting teacher profile picture:", teacherId);

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Delete from Cloudinary if exists
    if (
      teacher.profile?.profilePicture &&
      teacher.profile.profilePicture.includes("cloudinary")
    ) {
      try {
        const urlParts = teacher.profile.profilePicture.split("/");
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = `teacher-student-system/${
          publicIdWithExtension.split(".")[0]
        }`;

        await cloudinary.uploader.destroy(publicId);
        console.log("✅ Profile picture deleted from Cloudinary");
      } catch (deleteError) {
        console.log(
          "⚠️ Could not delete from Cloudinary:",
          deleteError.message
        );
      }
    }

    // Remove from database
    if (teacher.profile) {
      teacher.profile.profilePicture = null;
      await teacher.save();
    }

    res.json({
      success: true,
      message: "Profile picture deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting profile picture:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting profile picture",
      error: error.message,
    });
  }
};

// Get Teacher's Current Available Slots
export const getTeacherAvailability = async (req, res) => {
  const teacherId = req.user.id;

  try {
    console.log("📅 Fetching availability for teacher:", teacherId);

    const teacher = await Teacher.findById(teacherId).select(
      "availableSlots name"
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Filter out past slots (only show future slots)
    const now = new Date();
    const futureSlots = teacher.availableSlots.filter(
      (slot) => new Date(slot) > now
    );

    // Update teacher's availability to remove past slots
    if (futureSlots.length !== teacher.availableSlots.length) {
      teacher.availableSlots = futureSlots;
      await teacher.save();
      console.log(
        `🧹 Cleaned up ${
          teacher.availableSlots.length - futureSlots.length
        } expired slots`
      );
    }

    console.log(`✅ Found ${futureSlots.length} available slots`);

    res.json({
      success: true,
      data: {
        teacherName: teacher.name,
        availableSlots: futureSlots.sort((a, b) => new Date(a) - new Date(b)), // Sort by earliest first
        totalSlots: futureSlots.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching teacher availability:", error);
    logger.error(`Failed to fetch teacher availability: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching availability",
      error: error.message,
    });
  }
};

// Delete Specific Available Slot
export const deleteAvailabilitySlot = async (req, res) => {
  const teacherId = req.user.id;
  const { slotDateTime } = req.body;

  try {
    console.log("🗑️ Deleting availability slot:", { teacherId, slotDateTime });

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Remove the specific slot
    const slotToRemove = new Date(slotDateTime);
    teacher.availableSlots = teacher.availableSlots.filter(
      (slot) => new Date(slot).getTime() !== slotToRemove.getTime()
    );

    await teacher.save();

    console.log("✅ Availability slot deleted successfully");
    logger.info(
      `Teacher availability slot deleted: ${teacherId} - ${slotDateTime}`
    );

    res.json({
      success: true,
      message: "Availability slot removed successfully",
      data: {
        remainingSlots: teacher.availableSlots.length,
      },
    });
  } catch (error) {
    console.error("❌ Error deleting availability slot:", error);
    logger.error(`Failed to delete availability slot: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error removing availability slot",
      error: error.message,
    });
  }
};
