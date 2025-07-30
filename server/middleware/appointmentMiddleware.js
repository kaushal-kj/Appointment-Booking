import { updateExpiredAppointments } from "../services/appointmentService.js";

// Middleware to auto-update appointments before reading
export const autoUpdateAppointments = async (req, res, next) => {
  try {
    // Only run auto-update for GET requests to appointment endpoints
    if (req.method === 'GET' && req.path.includes('appointment')) {
      await updateExpiredAppointments();
    }
    next();
  } catch (error) {
    // Don't fail the request if auto-update fails, just log it
    console.error("Auto-update middleware error:", error);
    next();
  }
};
