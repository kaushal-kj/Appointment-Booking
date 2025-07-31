import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { showToast } from "../../config/toastConfig";
import axios from "../../services/axios";
import {
  FiX,
  FiCalendar,
  FiClock,
  FiUser,
  FiMessageSquare,
  FiSend,
  FiAlertCircle,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";

const BookForm = ({ teacher, close }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [bookingMode, setBookingMode] = useState("available"); // "available" or "custom"

  // Watch form values
  const selectedSlot = watch("selectedSlot");
  const customDateTime = watch("customDateTime");

  // Fetch available slots for this teacher
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      try {
        setIsLoadingSlots(true);
        const response = await axios.get(
          `/student/teacher/${teacher._id}/slots`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          setAvailableSlots(response.data.data.availableSlots);
        }
      } catch (error) {
        console.error("Failed to fetch available slots:", error);
        showToast.error("Failed to load available time slots");
      } finally {
        setIsLoadingSlots(false);
      }
    };

    if (teacher?._id) {
      fetchAvailableSlots();
    }
  }, [teacher._id]);

  // Auto-switch to custom mode if no available slots
  useEffect(() => {
    if (!isLoadingSlots && availableSlots.length === 0) {
      setBookingMode("custom");
    }
  }, [isLoadingSlots, availableSlots.length]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      const appointmentData = {
        teacherId: teacher._id,
        dateTime:
          bookingMode === "available" ? data.selectedSlot : data.customDateTime,
        purpose: data.purpose,
        bookingType:
          bookingMode === "available" ? "slot_booking" : "custom_request", // Add booking type to track request vs booking
      };

      const response = await axios.post("/student/book", appointmentData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.data.success) {
        const message =
          bookingMode === "available"
            ? "Appointment booked successfully! Teacher will confirm shortly."
            : "Appointment request sent successfully! Teacher will review your requested time.";
        showToast.student(message);
        close();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to book appointment";
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date();
  const minDateTime = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <FiUser className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {bookingMode === "available"
                  ? "Book Appointment"
                  : "Request Appointment"}
              </h3>
              <p className="text-slate-600">with {teacher.name}</p>
            </div>
          </div>
          <button
            onClick={close}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
          >
            <FiX className="text-xl text-slate-500" />
          </button>
        </div>

        {/* Booking Mode Toggle */}
        {availableSlots.length > 0 && (
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-800">Booking Mode</h4>
                <p className="text-sm text-slate-600">
                  {bookingMode === "available"
                    ? "Choose from available slots"
                    : "Request your preferred time"}
                </p>
              </div>
              <button
                onClick={() =>
                  setBookingMode(
                    bookingMode === "available" ? "custom" : "available"
                  )
                }
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  bookingMode === "available"
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                }`}
              >
                {bookingMode === "available" ? (
                  <FiToggleRight />
                ) : (
                  <FiToggleLeft />
                )}
                <span className="text-sm font-medium">
                  {bookingMode === "available"
                    ? "Available Slots"
                    : "Custom Request"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Available Slots Mode */}
          {bookingMode === "available" && (
            <div>
              <label className=" text-sm font-semibold text-slate-700 mb-3 flex items-center space-x-2">
                <FiCalendar className="text-green-600" />
                <span>Select Available Time Slot</span>
              </label>

              {isLoadingSlots ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse bg-gray-200 h-12 rounded-xl"
                    ></div>
                  ))}
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                  <FiClock className="text-2xl text-orange-400 mx-auto mb-2" />
                  <p className="text-orange-700 font-medium">
                    No available slots
                  </p>
                  <p className="text-orange-600 text-sm">
                    Switch to custom request to propose your preferred time
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableSlots.map((slot) => {
                    const slotDate = new Date(slot);

                    return (
                      <label
                        key={slot}
                        className="flex items-center p-4 border border-slate-200 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all duration-200 cursor-pointer"
                      >
                        <input
                          type="radio"
                          value={slot}
                          {...register("selectedSlot", {
                            required:
                              bookingMode === "available"
                                ? "Please select a time slot"
                                : false,
                          })}
                          className="mr-3 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <FiCalendar className="text-green-600" />
                            <div>
                              <div className="font-semibold text-slate-800">
                                {slotDate.toLocaleDateString("en-US", {
                                  weekday: "long",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  timeZone: "Asia/Kolkata",
                                })}
                              </div>
                              <div className="text-sm text-green-600 font-medium">
                                {slotDate.toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                  timeZone: "Asia/Kolkata",
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {errors.selectedSlot && (
                <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                  <FiAlertCircle className="text-xs" />
                  <span>{errors.selectedSlot.message}</span>
                </p>
              )}
            </div>
          )}

          {/* Custom Request Mode */}
          {bookingMode === "custom" && (
            <div>
              <label className=" text-sm font-semibold text-slate-700 mb-3 flex items-center space-x-2">
                <FiClock className="text-orange-600" />
                <span>Request Your Preferred Date & Time</span>
              </label>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <FiAlertCircle className="text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-orange-800 font-medium text-sm">
                      Custom Time Request
                    </p>
                    <p className="text-orange-700 text-xs mt-1">
                      The teacher will review your requested time and either
                      approve or suggest an alternative.
                    </p>
                  </div>
                </div>
              </div>

              <input
                type="datetime-local"
                {...register("customDateTime", {
                  required:
                    bookingMode === "custom"
                      ? "Please select your preferred date and time"
                      : false,
                  validate:
                    bookingMode === "custom"
                      ? (value) => {
                          const selectedDate = new Date(value);
                          const now = new Date();
                          if (selectedDate <= now) {
                            return "Please select a future date and time";
                          }
                          return true;
                        }
                      : undefined,
                })}
                min={minDateTime}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />

              {errors.customDateTime && (
                <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                  <FiAlertCircle className="text-xs" />
                  <span>{errors.customDateTime.message}</span>
                </p>
              )}
            </div>
          )}

          {/* Purpose */}
          <div>
            <label className=" text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
              <FiMessageSquare className="text-blue-600" />
              <span>
                Purpose{" "}
                {bookingMode === "custom" ? "(Recommended)" : "(Optional)"}
              </span>
            </label>
            <textarea
              {...register("purpose", {
                required:
                  bookingMode === "custom"
                    ? "Please explain the purpose for your custom request"
                    : false,
              })}
              rows={3}
              placeholder={
                bookingMode === "custom"
                  ? "Please explain what you'd like to discuss and why this specific time works for you..."
                  : "Briefly describe what you'd like to discuss..."
              }
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            {errors.purpose && (
              <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                <FiAlertCircle className="text-xs" />
                <span>{errors.purpose.message}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={close}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-6 rounded-xl font-semibold transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                bookingMode === "available"
                  ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                  : "bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>
                    {bookingMode === "available"
                      ? "Booking..."
                      : "Requesting..."}
                  </span>
                </>
              ) : (
                <>
                  <FiSend />
                  <span>
                    {bookingMode === "available" ? "Book Now" : "Send Request"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookForm;
