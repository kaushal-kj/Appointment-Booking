import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    purpose: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "canceled", "completed"],
      default: "pending",
    },
    bookingType: {
      type: String,
      enum: ["slot_booking", "custom_request"],
      default: "custom_request",
    },
    autoUpdated: {
      type: Boolean,
      default: false,
    },
    autoUpdatedAt: Date,
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
