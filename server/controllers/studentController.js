import Teacher from "../models/Teacher.js";
import Appointment from "../models/Appointment.js";
import logger from "../utils/logger.js";
import Student from "../models/Student.js";
import { updateExpiredAppointments } from "../services/appointmentService.js";
import cloudinary from "../config/cloudinary.js";

// Get All Teachers
// Get All Teachers with Session Count
// Get All Teachers with Completed Session Count
export const getAllTeachers = async (req, res) => {
  try {
    console.log(
      "📋 Fetching all teachers with session counts and availability"
    );

    const teachersWithStats = await Teacher.aggregate([
      {
        $lookup: {
          from: "appointments",
          let: { teacherId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$teacher", "$$teacherId"] },
              },
            },
          ],
          as: "appointments",
        },
      },
      {
        $addFields: {
          totalSessions: {
            $size: {
              $filter: {
                input: "$appointments",
                cond: { $eq: ["$$this.status", "completed"] },
              },
            },
          },
          approvedSessions: {
            $size: {
              $filter: {
                input: "$appointments",
                cond: { $eq: ["$$this.status", "approved"] },
              },
            },
          },
          pendingSessions: {
            $size: {
              $filter: {
                input: "$appointments",
                cond: { $eq: ["$$this.status", "pending"] },
              },
            },
          },
          totalAppointments: { $size: "$appointments" },

          // Add availability logic
          hasAvailableSlots: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: "$availableSlots",
                    cond: { $gt: ["$$this", new Date()] }, // Only future slots
                  },
                },
              },
              0,
            ],
          },

          // Get actual available slots (future only)
          futureAvailableSlots: {
            $filter: {
              input: "$availableSlots",
              cond: { $gt: ["$$this", new Date()] },
            },
          },

          availableSlotsCount: {
            $size: {
              $filter: {
                input: "$availableSlots",
                cond: { $gt: ["$$this", new Date()] },
              },
            },
          },
        },
      },
      {
        $project: {
          password: 0,
          appointments: 0,
          availableSlots: 0, // Don't expose raw slots to students, use futureAvailableSlots instead
        },
      },
      {
        $sort: {
          hasAvailableSlots: -1, // Available teachers first
          averageRating: -1, // Then by rating
          totalSessions: -1, // Then by experience
        },
      },
    ]);

    logger.info(
      `Teachers fetched with availability: ${teachersWithStats.length} teachers`
    );
    res.json(teachersWithStats);
  } catch (error) {
    console.error("❌ Error fetching teachers:", error);
    logger.error(`Failed to fetch teachers: ${error.message}`);
    res.status(500).json({ message: "Error fetching teachers", error });
  }
};

// Book Appointment
// Book Appointment (Updated to remove slot when approved)
// Book Appointment (Updated to handle both slot booking and custom requests)
export const bookAppointment = async (req, res) => {
  const studentId = req.user.id;
  const { teacherId, dateTime, purpose, bookingType } = req.body;

  try {
    console.log("📝 Booking appointment:", {
      studentId,
      teacherId,
      dateTime,
      bookingType,
    });

    // Validate teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const requestedSlot = new Date(dateTime);
    let finalBookingType = bookingType || "custom_request";

    // If booking from available slot, verify slot exists and set booking type
    if (bookingType === "available" || bookingType === "slot_booking") {
      const isSlotAvailable = teacher.availableSlots.some(
        (slot) => new Date(slot).getTime() === requestedSlot.getTime()
      );

      if (!isSlotAvailable) {
        return res.status(400).json({
          success: false,
          message:
            "This time slot is no longer available. Please select another slot or make a custom request.",
        });
      }
      finalBookingType = "slot_booking";
    }

    // Check for existing appointment at same time
    const existingAppointment = await Appointment.findOne({
      teacher: teacherId,
      dateTime: requestedSlot,
      status: { $in: ["pending", "approved"] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked or pending approval",
      });
    }

    // Create appointment
    const appointment = new Appointment({
      student: studentId,
      teacher: teacherId,
      dateTime: requestedSlot,
      purpose: purpose || "",
      status: "pending",
      bookingType: finalBookingType,
    });

    await appointment.save();

    // Populate appointment for response
    await appointment.populate([
      { path: "student", select: "name email" },
      { path: "teacher", select: "name email subject" },
    ]);

    console.log("✅ Appointment booked successfully");
    logger.info(
      `Appointment ${finalBookingType}: ${studentId} -> ${teacherId} at ${dateTime}`
    );

    const responseMessage =
      finalBookingType === "slot_booking"
        ? "Appointment booked successfully! Teacher will confirm shortly."
        : "Appointment request sent successfully! Teacher will review your requested time.";

    res.status(201).json({
      success: true,
      message: responseMessage,
      data: appointment,
    });
  } catch (error) {
    console.error("❌ Error booking appointment:", error);
    logger.error(`Failed to book appointment: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error booking appointment",
      error: error.message,
    });
  }
};

// Get Available Slots for a Specific Teacher
export const getTeacherAvailableSlots = async (req, res) => {
  const { teacherId } = req.params;

  try {
    console.log("📅 Fetching available slots for teacher:", teacherId);

    const teacher = await Teacher.findById(teacherId).select(
      "name availableSlots"
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Filter out past slots and sort by earliest first
    const now = new Date();
    const availableSlots = teacher.availableSlots
      .filter((slot) => new Date(slot) > now)
      .sort((a, b) => new Date(a) - new Date(b));

    console.log(`✅ Found ${availableSlots.length} available slots`);

    res.json({
      success: true,
      data: {
        teacherName: teacher.name,
        availableSlots: availableSlots,
        totalSlots: availableSlots.length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching teacher slots:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching available slots",
      error: error.message,
    });
  }
};

// View Own Appointments
// Get My Appointments with Auto-Update
export const getMyAppointments = async (req, res) => {
  const studentId = req.user.id;

  try {
    console.log("📋 Fetching appointments for student:", studentId);

    // Auto-update expired appointments first
    await updateExpiredAppointments();

    const appointments = await Appointment.find({ student: studentId })
      .populate({
        path: "teacher",
        select: "name email subject department profile", // Include profile field
      })
      .populate("student", "name email")
      .sort({ dateTime: -1 });

    console.log(`✅ Found ${appointments.length} appointments for student`);
    logger.info(`Student appointments fetched: ${studentId}`);

    res.json(appointments);
  } catch (error) {
    console.error("❌ Error fetching student appointments:", error);
    logger.error(`Failed to fetch student appointments: ${error.message}`);
    res.status(500).json({
      message: "Error fetching appointments",
      error,
    });
  }
};

// Get Student Dashboard Statistics
export const getStudentStats = async (req, res) => {
  const studentId = req.user.id;

  try {
    console.log("📊 Fetching stats for student:", studentId);

    // Get total appointments for this student
    const totalAppointments = await Appointment.countDocuments({
      student: studentId,
    });

    // Get pending appointments
    const pendingAppointments = await Appointment.countDocuments({
      student: studentId,
      status: "pending",
    });

    // Get approved appointments
    const approvedAppointments = await Appointment.countDocuments({
      student: studentId,
      status: "approved",
    });

    // Get total available teachers
    const availableTeachers = await Teacher.countDocuments();

    // Calculate monthly change (last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentAppointments = await Appointment.countDocuments({
      student: studentId,
      createdAt: { $gte: thirtyDaysAgo },
    });

    const previousPeriodAppointments = await Appointment.countDocuments({
      student: studentId,
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    });

    // Calculate percentage change
    let monthlyChange = 0;
    if (previousPeriodAppointments > 0) {
      monthlyChange = Math.round(
        ((recentAppointments - previousPeriodAppointments) /
          previousPeriodAppointments) *
          100
      );
    } else if (recentAppointments > 0) {
      monthlyChange = 100;
    }

    const stats = {
      totalAppointments,
      pendingAppointments,
      approvedAppointments,
      availableTeachers,
      monthlyChange,
      recentAppointments,
      previousPeriodAppointments,
    };

    console.log("✅ Stats calculated:", stats);
    logger.info(`Student stats fetched for: ${studentId}`);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("❌ Error fetching student stats:", error);
    logger.error(`Failed to fetch student stats: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};

// profile section
// Get Student Profile
export const getStudentProfile = async (req, res) => {
  const studentId = req.user.id;

  try {
    console.log("📋 Fetching profile for student:", studentId);

    const student = await Student.findById(studentId).select(
      "-password -resetToken -resetTokenExpiry"
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    console.log("✅ Student profile found");
    logger.info(`Student profile fetched: ${studentId}`);

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("❌ Error fetching student profile:", error);
    logger.error(`Failed to fetch student profile: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// Update Student Profile
export const updateStudentProfile = async (req, res) => {
  const studentId = req.user.id;
  const updates = req.body;

  try {
    console.log("📝 Updating profile for student:", studentId);
    console.log("Updates:", updates);

    // Don't allow updating sensitive fields
    const restrictedFields = [
      "password",
      "email",
      "isApproved",
      "resetToken",
      "resetTokenExpiry",
    ];
    restrictedFields.forEach((field) => delete updates[field]);

    const student = await Student.findByIdAndUpdate(
      studentId,
      {
        ...updates,
        updatedAt: Date.now(),
      },
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validations
      }
    ).select("-password -resetToken -resetTokenExpiry");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    console.log("✅ Student profile updated");
    logger.info(`Student profile updated: ${studentId}`);

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: student,
    });
  } catch (error) {
    console.error("❌ Error updating student profile:", error);
    logger.error(`Failed to update student profile: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// Update Student Profile Picture
export const updateStudentProfilePicture = async (req, res) => {
  const studentId = req.user.id;

  try {
    console.log("🖼️ Updating student profile picture:", studentId);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Delete old profile picture from Cloudinary if exists
    if (
      student.profile?.profilePicture &&
      student.profile.profilePicture.includes("cloudinary")
    ) {
      try {
        const urlParts = student.profile.profilePicture.split("/");
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

    // Update student profile with new image URL
    if (!student.profile) {
      student.profile = {};
    }

    student.profile.profilePicture = req.file.path;
    await student.save();

    console.log("✅ Student profile picture updated successfully");

    res.json({
      success: true,
      message: "Profile picture updated successfully",
      data: {
        profilePicture: student.profile.profilePicture,
        studentId: student._id,
      },
    });
  } catch (error) {
    console.error("❌ Error updating profile picture:", error);

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

// Rate a Teacher
export const rateTeacher = async (req, res) => {
  const studentId = req.user.id;
  const { teacherId, rating, review } = req.body;

  try {
    console.log("⭐ Rating teacher:", { studentId, teacherId, rating });

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Check if student has completed appointment with this teacher
    const completedAppointment = await Appointment.findOne({
      student: studentId,
      teacher: teacherId,
      status: "approved",
    });

    if (!completedAppointment) {
      return res.status(400).json({
        success: false,
        message: "You can only rate teachers after completing an appointment",
      });
    }

    // Check if student already rated this teacher
    const existingRatingIndex = teacher.ratings.findIndex(
      (r) => r.student.toString() === studentId
    );

    if (existingRatingIndex !== -1) {
      // Update existing rating
      teacher.ratings[existingRatingIndex] = {
        student: studentId,
        rating: rating,
        review: review || "",
        createdAt: new Date(),
      };
    } else {
      // Add new rating
      teacher.ratings.push({
        student: studentId,
        rating: rating,
        review: review || "",
        createdAt: new Date(),
      });
    }

    await teacher.save(); // This will trigger the pre-save hook to calculate average

    console.log("✅ Teacher rated successfully");
    logger.info(
      `Teacher rated: ${teacherId} by student ${studentId} - ${rating} stars`
    );

    res.json({
      success: true,
      message: "Rating submitted successfully",
      data: {
        averageRating: teacher.averageRating,
        totalRatings: teacher.totalRatings,
      },
    });
  } catch (error) {
    console.error("❌ Error rating teacher:", error);
    logger.error(`Failed to rate teacher: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Error submitting rating",
      error: error.message,
    });
  }
};

// Get Student's Existing Rating for a Teacher
export const getStudentRating = async (req, res) => {
  const studentId = req.user.id;
  const { teacherId } = req.params;

  try {
    console.log("🔍 Getting existing rating:", { studentId, teacherId });

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Find existing rating from this student
    const existingRating = teacher.ratings.find(
      (rating) => rating.student.toString() === studentId
    );

    if (existingRating) {
      res.json({
        success: true,
        data: {
          hasRated: true,
          rating: existingRating.rating,
          review: existingRating.review,
          ratedAt: existingRating.createdAt,
        },
      });
    } else {
      res.json({
        success: true,
        data: {
          hasRated: false,
          rating: 0,
          review: "",
          ratedAt: null,
        },
      });
    }
  } catch (error) {
    console.error("❌ Error getting student rating:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching rating",
      error: error.message,
    });
  }
};
