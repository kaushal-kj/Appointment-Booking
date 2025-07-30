import Appointment from "../models/Appointment.js";
import logger from "../utils/logger.js";

// Auto-update appointment statuses based on datetime
export const updateExpiredAppointments = async () => {
  try {
    const now = new Date();

    // Update pending appointments that are past their datetime to canceled
    const expiredPendingResult = await Appointment.updateMany(
      {
        status: "pending",
        dateTime: { $lt: now },
        autoUpdated: { $ne: true },
      },
      {
        $set: {
          status: "canceled",
          autoUpdated: true,
          autoUpdatedAt: now,
        },
      }
    );

    // Update approved appointments that are past their datetime to completed
    const expiredApprovedResult = await Appointment.updateMany(
      {
        status: "approved",
        dateTime: { $lt: now },
        autoUpdated: { $ne: true },
      },
      {
        $set: {
          status: "completed",
          autoUpdated: true,
          autoUpdatedAt: now,
        },
      }
    );

    if (
      expiredPendingResult.modifiedCount > 0 ||
      expiredApprovedResult.modifiedCount > 0
    ) {
      logger.info(
        `Auto-updated appointments: ${expiredPendingResult.modifiedCount} pending→canceled, ${expiredApprovedResult.modifiedCount} approved→completed`
      );
    }

    return {
      pendingToCanceled: expiredPendingResult.modifiedCount,
      approvedToCompleted: expiredApprovedResult.modifiedCount,
    };
  } catch (error) {
    logger.error(`Failed to auto-update appointments: ${error.message}`);
    throw error;
  }
};

// Update specific appointment if needed
export const updateSingleAppointmentStatus = async (appointmentId) => {
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return null;

    const now = new Date();
    let newStatus = appointment.status;

    if (appointment.dateTime < now && !appointment.autoUpdated) {
      if (appointment.status === "pending") {
        newStatus = "canceled";
      } else if (appointment.status === "approved") {
        newStatus = "completed";
      }

      if (newStatus !== appointment.status) {
        appointment.status = newStatus;
        appointment.autoUpdated = true;
        appointment.autoUpdatedAt = now;
        await appointment.save();

        logger.info(
          `Auto-updated single appointment ${appointmentId}: ${appointment.status} → ${newStatus}`
        );
      }
    }

    return appointment;
  } catch (error) {
    logger.error(
      `Failed to update single appointment ${appointmentId}: ${error.message}`
    );
    throw error;
  }
};
