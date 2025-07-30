import { useEffect, useState, useRef } from "react";
import axios from "../../services/axios";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiMessageSquare,
  FiCheckCircle,
  FiCheck,
  FiAlertCircle,
  FiXCircle,
  FiRefreshCw,
  FiFilter,
  FiMail,
  FiChevronDown,
  FiList,
  FiX,
  FiPhone,
  FiSearch, // Add search icon
} from "react-icons/fi";
import { showToast } from "../../config/toastConfig";

const TeacherAppointments = ({ refreshTrigger, onStatusUpdate }) => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState(""); // Add search state
  const [lastUpdated, setLastUpdated] = useState(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const intervalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".relative")) {
        setStatusDropdownOpen(false);
      }
    };

    if (statusDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [statusDropdownOpen]);

  const fetchAppointments = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const res = await axios.get("/teacher/appointments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAppointments(res.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      showToast.error("Failed to load appointments");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    // Set up auto-refresh every 30 seconds
    intervalRef.current = setInterval(() => {
      fetchAppointments(false);
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshTrigger]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `/teacher/appointments/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Show success message
      const statusMessages = {
        approved: "Appointment approved successfully!",
        canceled: "Appointment cancelled successfully!",
      };

      if (statusMessages[status]) {
        showToast.teacher(statusMessages[status]);
      }

      fetchAppointments(false);

      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (err) {
      showToast.error(
        err.response?.data?.message || "Failed to update appointment status"
      );
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      approved: {
        icon: FiCheckCircle,
        bgColor: "bg-green-100",
        textColor: "text-green-700",
        borderColor: "border-green-200",
        label: "Approved",
      },
      pending: {
        icon: FiClock,
        bgColor: "bg-orange-100",
        textColor: "text-orange-700",
        borderColor: "border-orange-200",
        label: "Pending Review",
      },
      canceled: {
        icon: FiXCircle,
        bgColor: "bg-red-100",
        textColor: "text-red-700",
        borderColor: "border-red-200",
        label: "Canceled",
      },
      completed: {
        icon: FiCheckCircle,
        bgColor: "bg-blue-100",
        textColor: "text-blue-700",
        borderColor: "border-blue-200",
        label: "Completed",
      },
    };
    return configs[status] || configs.pending;
  };

  // Enhanced filtering function with search
  const getFilteredAppointments = () => {
    return appointments.filter((appt) => {
      // Filter by status
      const matchesStatus = filter === "all" || appt.status === filter;

      // Filter by search term (student name)
      const matchesSearch =
        searchTerm === "" ||
        appt.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appt.purpose &&
          appt.purpose.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesStatus && matchesSearch;
    });
  };

  // Smart sorting function
  const getSortedAppointments = (appointmentsToSort) => {
    const now = new Date();

    const upcomingApproved = appointmentsToSort.filter(
      (appt) => appt.status === "approved" && new Date(appt.dateTime) > now
    );

    const pendingAppointments = appointmentsToSort.filter(
      (appt) => appt.status === "pending"
    );

    const otherAppointments = appointmentsToSort.filter(
      (appt) =>
        !(appt.status === "approved" && new Date(appt.dateTime) > now) &&
        appt.status !== "pending"
    );

    pendingAppointments.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    upcomingApproved.sort(
      (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
    );
    otherAppointments.sort(
      (a, b) => new Date(b.dateTime) - new Date(a.dateTime)
    );

    return [...pendingAppointments, ...upcomingApproved, ...otherAppointments];
  };

  // Apply both filtering and sorting
  const filteredAndSortedAppointments = getSortedAppointments(
    getFilteredAppointments()
  );

  const getPendingCount = () => {
    return appointments.filter((appt) => appt.status === "pending").length;
  };

  // Get search results count
  const getSearchResultsCount = () => {
    return getFilteredAppointments().length;
  };

  const getTimeUntilAppointment = (dateTime) => {
    const now = new Date();
    const appointmentDate = new Date(dateTime);
    const diffInHours = Math.ceil((appointmentDate - now) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.ceil((appointmentDate - now) / (1000 * 60));
      return diffInMinutes > 0 ? `in ${diffInMinutes} min` : "starting soon";
    } else if (diffInHours < 24) {
      return `in ${diffInHours} hour${diffInHours > 1 ? "s" : ""}`;
    } else {
      const diffInDays = Math.ceil(diffInHours / 24);
      return `in ${diffInDays} day${diffInDays > 1 ? "s" : ""}`;
    }
  };

  if (isLoading && appointments.length === 0) {
    return (
      <section>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      {/* Section Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col  gap-4">
          {/* Title and Live Indicator */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center justify-between w-full">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center space-x-2">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FiCalendar className="text-green-600 text-xl" />
                  </div>
                  <span>Appointment Requests</span>
                  <div className="flex items-center space-x-2 ml-4"></div>
                </h3>
                <div className="flex items-center space-x-4 text-slate-600">
                  <span>
                    {getPendingCount()} pending requests •{" "}
                    {searchTerm
                      ? `${getSearchResultsCount()} found`
                      : `${appointments.length} total`}
                  </span>
                  {lastUpdated && (
                    <span className="text-xs">
                      Updated:{" "}
                      {lastUpdated.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <button
                  onClick={() => fetchAppointments()}
                  className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors duration-200 group "
                  title="Refresh appointments"
                >
                  <FiRefreshCw className="text-slate-600 group-hover:rotate-180 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center group-focus-within:shadow-md transition-all duration-200">
                    <FiSearch className="w-3 h-3 text-white" />
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Search by student name, email, or purpose..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="
        w-full pl-12 pr-10 py-3
        border border-slate-200 rounded-xl
        bg-white
        text-slate-700 font-medium
        placeholder:text-slate-400
        focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
        hover:border-slate-300 hover:shadow-sm
        transition-all duration-200
        shadow-sm
      "
                />

                {/* Enhanced clear button */}
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all duration-200 group"
                    title="Clear search"
                  >
                    <FiX className="w-3 h-3 text-slate-500 group-hover:text-slate-700" />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="px-4 py-3 text-slate-700 hover:text-blue-600 font-medium transition-all duration-200 hover:bg-blue-50 rounded-xl flex items-center space-x-3 border border-slate-200 bg-white w-full min-w-[160px] shadow-sm hover:shadow-md"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                  <FiFilter className="w-3 h-3 text-white" />
                </div>
                <span className="flex-1 text-left">
                  {filter === "all"
                    ? "All Status"
                    : filter === "pending"
                    ? "Pending"
                    : filter === "approved"
                    ? "Approved"
                    : filter === "completed"
                    ? "Completed"
                    : filter === "canceled"
                    ? "Canceled"
                    : "All Status"}
                </span>
                <FiChevronDown
                  className={`text-sm transition-transform duration-200 ${
                    statusDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {statusDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-blue-100 min-w-[180px] overflow-hidden z-50">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setFilter("all");
                        setStatusDropdownOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer text-left ${
                        filter === "all" ? "bg-blue-50 text-blue-600" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center ${
                          filter === "all"
                            ? "from-blue-100 to-blue-200 text-blue-600"
                            : "from-slate-100 to-slate-200 text-slate-500"
                        }`}
                      >
                        <FiList className="text-sm" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">All Status</div>
                        <div className="text-xs text-slate-500">
                          View all items
                        </div>
                      </div>
                      {/* Add count badge */}
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          filter === "all"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {appointments.length}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setFilter("pending");
                        setStatusDropdownOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer text-left ${
                        filter === "pending" ? "bg-blue-50 text-blue-600" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center ${
                          filter === "pending"
                            ? "from-orange-100 to-orange-200 text-orange-600"
                            : "from-slate-100 to-slate-200 text-slate-500"
                        }`}
                      >
                        <FiClock className="text-sm" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Pending</div>
                        <div className="text-xs text-slate-500">
                          Awaiting action
                        </div>
                      </div>
                      {/* Add count badge */}
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          filter === "pending"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {
                          appointments.filter((apt) => apt.status === "pending")
                            .length
                        }
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setFilter("approved");
                        setStatusDropdownOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer text-left ${
                        filter === "approved" ? "bg-blue-50 text-blue-600" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center ${
                          filter === "approved"
                            ? "from-green-100 to-green-200 text-green-600"
                            : "from-slate-100 to-slate-200 text-slate-500"
                        }`}
                      >
                        <FiCheckCircle className="text-sm" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Approved</div>
                        <div className="text-xs text-slate-500">
                          Ready to proceed
                        </div>
                      </div>
                      {/* Add count badge */}
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          filter === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {
                          appointments.filter(
                            (apt) => apt.status === "approved"
                          ).length
                        }
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setFilter("completed");
                        setStatusDropdownOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer text-left ${
                        filter === "completed" ? "bg-blue-50 text-blue-600" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center ${
                          filter === "completed"
                            ? "from-emerald-100 to-emerald-200 text-emerald-600"
                            : "from-slate-100 to-slate-200 text-slate-500"
                        }`}
                      >
                        <FiCheck className="text-sm" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Completed</div>
                        <div className="text-xs text-slate-500">
                          Successfully finished
                        </div>
                      </div>
                      {/* Add count badge */}
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          filter === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {
                          appointments.filter(
                            (apt) => apt.status === "completed"
                          ).length
                        }
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setFilter("canceled");
                        setStatusDropdownOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer text-left ${
                        filter === "canceled" ? "bg-blue-50 text-blue-600" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center ${
                          filter === "canceled"
                            ? "from-red-100 to-red-200 text-red-600"
                            : "from-slate-100 to-slate-200 text-slate-500"
                        }`}
                      >
                        <FiX className="text-sm" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Canceled</div>
                        <div className="text-xs text-slate-500">
                          Action canceled
                        </div>
                      </div>
                      {/* Add count badge */}
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          filter === "canceled"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {
                          appointments.filter(
                            (apt) => apt.status === "canceled"
                          ).length
                        }
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Results Info */}
          {searchTerm && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="flex items-center space-x-2">
                <FiSearch className="text-blue-600" />
                <span className="text-blue-800 font-medium">
                  {getSearchResultsCount() === 0
                    ? `No appointments found for "${searchTerm}"`
                    : `Found ${getSearchResultsCount()} appointment${
                        getSearchResultsCount() > 1 ? "s" : ""
                      } matching "${searchTerm}"`}
                </span>
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
                >
                  Clear search
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Priority Banner */}
      {getPendingCount() > 0 && filter === "all" && !searchTerm && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-2">
            <FiAlertCircle className="text-orange-600" />
            <span className="text-orange-800 font-medium">
              {getPendingCount()} appointment{getPendingCount() > 1 ? "s" : ""}{" "}
              need{getPendingCount() === 1 ? "s" : ""} your review (shown first)
            </span>
          </div>
        </div>
      )}

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAndSortedAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {searchTerm ? (
                <FiSearch className="text-2xl text-slate-400" />
              ) : (
                <FiCalendar className="text-2xl text-slate-400" />
              )}
            </div>
            <h4 className="text-xl font-semibold text-slate-800 mb-2">
              {searchTerm
                ? "No matching appointments"
                : "No appointments found"}
            </h4>
            <p className="text-slate-600">
              {searchTerm
                ? `No appointments found matching "${searchTerm}". Try a different search term.`
                : filter === "all"
                ? "No appointment requests yet. Students will be able to book sessions with you."
                : `No ${filter} appointments to show.`}
            </p>
          </div>
        ) : (
          filteredAndSortedAppointments.map((appt, index) => {
            const statusConfig = getStatusConfig(appt.status);
            const StatusIcon = statusConfig.icon;
            const appointmentDate = new Date(appt.dateTime);
            const now = new Date();
            const isUpcoming =
              appointmentDate > now && appt.status === "approved";
            const isPending = appt.status === "pending";
            const isCompleted = appt.status === "completed";

            // Highlight search matches
            const highlightText = (text, searchTerm) => {
              if (!searchTerm) return text;
              const regex = new RegExp(`(${searchTerm})`, "gi");
              const parts = text.split(regex);
              return parts.map((part, i) =>
                regex.test(part) ? (
                  <mark key={i} className="bg-yellow-200 px-1 rounded">
                    {part}
                  </mark>
                ) : (
                  part
                )
              );
            };

            return (
              <div
                key={appt._id}
                className={`group bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative ${
                  isPending
                    ? "border-orange-300 bg-gradient-to-r from-orange-50/70 to-red-50/70 ring-2 ring-orange-100"
                    : isUpcoming
                    ? "border-green-200 bg-gradient-to-r from-green-50/50 to-blue-50/50"
                    : isCompleted
                    ? "border-blue-200 bg-gradient-to-r from-blue-50/50 to-white"
                    : "border-gray-100"
                }`}
              >
                {/* Priority Badge for Pending */}
                {isPending && index < 3 && !searchTerm && (
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {index === 0 ? "Urgent" : `#${index + 1}`}
                  </div>
                )}

                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                          {appt.student.profile?.profilePicture ? (
                            <img
                              src={appt.student.profile.profilePicture}
                              alt={appt.student.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to initials if image fails to load
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : (
                            <span className="text-white font-bold text-lg">
                              {appt.student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
                            <span>
                              {highlightText(appt.student.name, searchTerm)}
                            </span>
                            {isPending && (
                              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                            )}
                            {isUpcoming && (
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            )}
                          </h4>
                          <p className="text-slate-600">Student</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-1 text-blue-600 text-sm">
                              <FiMail className="text-xs" />
                              <span>
                                {highlightText(appt.student.email, searchTerm)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                    </div>

                    {/* Appointment Details */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-3 text-slate-600">
                        <FiCalendar
                          className={
                            isPending
                              ? "text-orange-600"
                              : isUpcoming
                              ? "text-green-600"
                              : "text-blue-600"
                          }
                        />
                        <div>
                          <div
                            className={`font-semibold ${
                              isPending
                                ? "text-orange-700"
                                : isUpcoming
                                ? "text-green-700"
                                : ""
                            }`}
                          >
                            {appointmentDate.toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-sm text-slate-500">
                            {appointmentDate.getFullYear()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-slate-600">
                        <FiClock
                          className={
                            isPending
                              ? "text-orange-600"
                              : isUpcoming
                              ? "text-green-600"
                              : "text-cyan-600"
                          }
                        />
                        <div>
                          <div
                            className={`font-semibold ${
                              isPending
                                ? "text-orange-700"
                                : isUpcoming
                                ? "text-green-700"
                                : ""
                            }`}
                          >
                            {appointmentDate.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="text-sm text-slate-500">
                            {isUpcoming
                              ? "Upcoming session"
                              : isPending
                              ? "Needs approval"
                              : isCompleted
                              ? "Session completed"
                              : "Scheduled time"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Purpose */}
                    {appt.purpose && (
                      <div
                        className={`rounded-xl p-4 mb-4 ${
                          isPending
                            ? "bg-orange-50 border border-orange-200"
                            : "bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          <FiMessageSquare
                            className={`mt-0.5 flex-shrink-0 ${
                              isPending ? "text-orange-600" : "text-orange-600"
                            }`}
                          />
                          <div>
                            <div className="font-medium text-slate-700 mb-1">
                              Session Purpose:
                            </div>
                            <p className="text-slate-600 text-sm">
                              {highlightText(appt.purpose, searchTerm)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Auto-update indicator */}
                    {appt.autoUpdated && (
                      <div className="mt-2 flex items-center space-x-1 text-xs text-slate-500">
                        <FiRefreshCw className="text-xs" />
                        <span>
                          Auto-updated on{" "}
                          {new Date(appt.autoUpdatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="lg:w-64 flex flex-col justify-center space-y-3">
                    {appt.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(appt._id, "approved")}
                          className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:from-green-700 hover:to-green-800 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
                        >
                          <FiCheckCircle />
                          <span>Approve Session</span>
                        </button>
                        <button
                          onClick={() => updateStatus(appt._id, "canceled")}
                          className="bg-slate-100 hover:bg-red-100 text-slate-700 hover:text-red-700 py-3 px-6 rounded-xl font-medium transition-all duration-300 border border-slate-200 hover:border-red-200 flex items-center justify-center space-x-2"
                        >
                          <FiXCircle />
                          <span>Decline</span>
                        </button>
                      </>
                    )}

                    {appt.status === "approved" && isUpcoming && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                        <div className="text-green-600 font-medium text-sm">
                          Session Approved
                        </div>
                        <div className="text-green-500 text-xs mt-1">
                          {getTimeUntilAppointment(appt.dateTime)}
                        </div>
                      </div>
                    )}

                    {appt.status === "completed" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                        <div className="text-blue-600 font-medium text-sm">
                          Session Completed
                        </div>
                        <div className="text-blue-500 text-xs mt-1">
                          {appointmentDate.toLocaleDateString()}
                        </div>
                      </div>
                    )}

                    {appt.status === "canceled" && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                        <div className="text-red-600 font-medium text-sm">
                          Session Canceled
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Stats */}
      {appointments.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {appointments.length}
            </div>
            <div className="text-slate-600 text-sm">Total Requests</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {appointments.filter((a) => a.status === "pending").length}
            </div>
            <div className="text-slate-600 text-sm">Pending Review</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-green-600">
              {appointments.filter((a) => a.status === "approved").length}
            </div>
            <div className="text-slate-600 text-sm">Approved Sessions</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {appointments.filter((a) => a.status === "completed").length}
            </div>
            <div className="text-slate-600 text-sm">Completed</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-cyan-600">
              {
                appointments.filter(
                  (a) =>
                    a.status === "approved" && new Date(a.dateTime) > new Date()
                ).length
              }
            </div>
            <div className="text-slate-600 text-sm">Upcoming</div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TeacherAppointments;
