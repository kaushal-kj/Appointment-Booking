import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "../../services/axios";
import {
  FiCalendar,
  FiClock,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiTrash2,
  FiRefreshCw,
} from "react-icons/fi";
import { showToast } from "../../config/toastConfig";

const UpdateAvailability = ({ onSlotAdded }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue, // Add setValue from useForm
    watch, // Add watch to monitor form values
    formState: { errors },
  } = useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);

  // Watch the current slot value
  const watchedSlot = watch("slot");

  // Fetch existing availability slots
  const fetchAvailableSlots = async () => {
    try {
      setIsLoadingSlots(true);
      const response = await axios.get("/teacher/availability", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.data.success) {
        setAvailableSlots(response.data.data.availableSlots);
      }
    } catch (error) {
      console.error("Failed to fetch availability:", error);
      showToast.error("Failed to load available slots");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  // Auto-refresh every minute to remove expired slots
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setAvailableSlots((prev) => prev.filter((slot) => new Date(slot) > now));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const onSubmit = async ({ slot }) => {
    setIsLoading(true);
    try {
      await axios.post(
        "/teacher/availability",
        { slots: [slot] },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setSuccess(true);
      reset();

      // Refresh the slots list
      fetchAvailableSlots();

      // Call callback to refresh appointments
      if (onSlotAdded) onSlotAdded();

      showToast.teacher("Time slot added successfully!");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      showToast.error(
        err.response?.data?.message || "Failed to add availability slot"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Delete specific slot
  const handleDeleteSlot = async (slotDateTime) => {
    try {
      const response = await axios.delete("/teacher/availability", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        data: { slotDateTime },
      });

      if (response.data.success) {
        setAvailableSlots((prev) =>
          prev.filter(
            (slot) =>
              new Date(slot).getTime() !== new Date(slotDateTime).getTime()
          )
        );
        showToast.teacher("Time slot removed successfully!");
      }
    } catch (error) {
      showToast.error("Failed to remove time slot");
    }
  };

  // Quick add time function (FIXED VERSION)
  const handleQuickAddTime = (time) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [hours, minutes] = time.split(":");
    tomorrow.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const isoString = new Date(
      tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);

    // Use setValue from React Hook Form instead of direct DOM manipulation
    setValue("slot", isoString, {
      shouldValidate: true, // Trigger validation
      shouldDirty: true, // Mark field as dirty
      shouldTouch: true, // Mark field as touched
    });
  };

  // Check if slot is expiring soon (within 1 hour)
  const isExpiringSoon = (slotDateTime) => {
    const now = new Date();
    const slot = new Date(slotDateTime);
    const hourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    return slot <= hourFromNow && slot > now;
  };

  // Get minimum date (today)
  const today = new Date();
  const minDateTime = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);

  return (
    <section className="mb-3">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FiClock className="text-blue-600 text-xl" />
              </div>
              <span>Manage Availability</span>
            </h3>
            <p className="text-slate-600 mt-1">
              Add time slots when students can book appointments with you
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              {success && (
                <div className="bg-green-100 border border-green-200 rounded-xl p-3 flex items-center space-x-2 animate-in fade-in-50 duration-300">
                  <FiCheckCircle className="text-green-600" />
                  <span className="text-green-700 font-medium text-sm">
                    Slot added successfully!
                  </span>
                </div>
              )}
            </div>
            {/* <button
              onClick={fetchAvailableSlots}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-200"
              title="Refresh slots"
            >
              <FiRefreshCw className="text-slate-600" />
            </button> */}
            <div>
              <button
                onClick={fetchAvailableSlots}
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors duration-200 group "
                title="Refresh slots"
              >
                <FiRefreshCw className="text-slate-600 group-hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Current Available Slots */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-slate-700 flex items-center space-x-2">
              <FiCalendar className="text-blue-600" />
              <span>Your Available Time Slots</span>
            </h4>
            <span className="text-sm text-slate-500">
              {availableSlots.length} active slots
            </span>
          </div>

          {isLoadingSlots ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-200 h-16 rounded-xl"
                ></div>
              ))}
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
              <FiClock className="text-3xl text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 font-medium">No available slots</p>
              <p className="text-slate-500 text-sm">
                Add your first time slot below
              </p>
            </div>
          ) : (
            <div className="grid gap-3 max-h-64 overflow-y-auto">
              {availableSlots.map((slot, index) => {
                const slotDate = new Date(slot);
                const isExpiring = isExpiringSoon(slot);

                return (
                  <div
                    key={slot}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                      isExpiring
                        ? "bg-orange-50 border-orange-200 ring-1 ring-orange-200"
                        : "bg-blue-50 border-blue-200 hover:bg-blue-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isExpiring ? "bg-orange-100" : "bg-blue-100"
                        }`}
                      >
                        <FiClock
                          className={`${
                            isExpiring ? "text-orange-600" : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">
                          {slotDate.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            isExpiring ? "text-orange-600" : "text-blue-600"
                          }`}
                        >
                          {slotDate.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {isExpiring && " • Expiring soon"}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSlot(slot)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Remove this slot"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Date & Time Input */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                <FiCalendar className="text-blue-600" />
                <span>Add New Available Date & Time</span>
              </label>
              <input
                type="datetime-local"
                {...register("slot", {
                  required: "Please select a date and time",
                  validate: (value) => {
                    const selectedDate = new Date(value);
                    const now = new Date();
                    if (selectedDate <= now) {
                      return "Please select a future date and time";
                    }

                    // Check if slot already exists
                    const alreadyExists = availableSlots.some(
                      (slot) =>
                        new Date(slot).getTime() === selectedDate.getTime()
                    );
                    if (alreadyExists) {
                      return "This time slot already exists";
                    }

                    return true;
                  },
                })}
                min={minDateTime}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {errors.slot && (
                <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                  <FiAlertCircle className="text-xs" />
                  <span>{errors.slot.message}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Adding Slot...</span>
                  </>
                ) : (
                  <>
                    <FiPlus />
                    <span>Add Time Slot</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Time Suggestions - FIXED VERSION */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center space-x-2">
            <FiClock className="text-blue-600" />
            <span>Quick Add Common Times</span>
          </h4>

          {/* Show selected time preview */}
          {watchedSlot && (
            <div className="mb-3 p-2 bg-blue-100 rounded-lg">
              <p className="text-blue-700 text-sm">
                <span className="font-medium">Selected:</span>{" "}
                {new Date(watchedSlot).toLocaleString()}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              "09:00",
              "10:00",
              "11:00",
              "14:00",
              "15:00",
              "16:00",
              "17:00",
              "18:00",
            ].map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => handleQuickAddTime(time)} // Use the fixed function
                className="bg-white hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium border border-blue-200 hover:border-blue-300 transition-all duration-200 active:scale-95"
              >
                {time}
              </button>
            ))}
          </div>
          <p className="text-blue-600 text-xs mt-2">
            Click to set for tomorrow at the selected time
          </p>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
          <h4 className="font-semibold text-orange-800 mb-2">💡 Pro Tips:</h4>
          <ul className="text-orange-700 text-sm space-y-1">
            <li>• Slots automatically disappear once the time has passed</li>
            <li>
              • Add multiple slots throughout the week to give students
              flexibility
            </li>
            <li>
              • Consider peak hours when students are most likely to book (10 AM
              - 4 PM)
            </li>
            <li>• Leave buffer time between appointments for preparation</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default UpdateAvailability;
