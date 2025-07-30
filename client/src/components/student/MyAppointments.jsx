import { useEffect, useState } from "react";
import { showToast } from "../../config/toastConfig";
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
  FiArrowUp,
  FiChevronDown,
  FiList,
  FiSearch, // Add search icon
  FiX, // Add X icon for clear button
} from "react-icons/fi";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState(""); // Add search state
  const [lastUpdated, setLastUpdated] = useState(null); // Add last updated state
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);
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
      const res = await axios.get("/student/appointments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Handle response - assuming it's an array based on previous conversation
      const appointmentsData = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];
      setAppointments(appointmentsData);
      setLastUpdated(new Date()); // Set last updated time
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      showToast.error("Failed to load appointments");
      setAppointments([]); // Set empty array on error
    } finally {
      if (showLoading) setIsLoading(false);
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
        label: "Pending",
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
    if (!Array.isArray(appointments)) return [];

    return appointments.filter((appt) => {
      // Filter by status
      const matchesStatus = filter === "all" || appt.status === filter;

      // Filter by search term (teacher name, subject, or purpose)
      const matchesSearch =
        searchTerm === "" ||
        (appt.teacher?.name &&
          appt.teacher.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (appt.teacher?.subject &&
          appt.teacher.subject
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (appt.teacher?.department &&
          appt.teacher.department
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (appt.purpose &&
          appt.purpose.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesStatus && matchesSearch;
    });
  };

  // Smart sorting function
  const getSortedAppointments = (appointmentsToSort) => {
    if (!Array.isArray(appointmentsToSort)) return [];

    const now = new Date();

    // Separate appointments by categories
    const upcomingApproved = appointmentsToSort.filter(
      (appt) => appt.status === "approved" && new Date(appt.dateTime) > now
    );

    const otherAppointments = appointmentsToSort.filter(
      (appt) => !(appt.status === "approved" && new Date(appt.dateTime) > now)
    );

    // Sort upcoming approved by nearest time first (ascending)
    upcomingApproved.sort(
      (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
    );

    // Sort other appointments by most recent first (descending)
    otherAppointments.sort(
      (a, b) => new Date(b.dateTime) - new Date(a.dateTime)
    );

    // Combine: upcoming approved first, then others
    return [...upcomingApproved, ...otherAppointments];
  };

  // Apply both filtering and sorting
  const filteredAndSortedAppointments = getSortedAppointments(
    getFilteredAppointments()
  );

  const getUpcomingAppointments = () => {
    if (!Array.isArray(appointments)) return 0;

    const now = new Date();
    return appointments.filter(
      (appt) => appt.status === "approved" && new Date(appt.dateTime) > now
    ).length;
  };

  // Get search results count
  const getSearchResultsCount = () => {
    return getFilteredAppointments().length;
  };

  // Helper function to get time until appointment
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

  // Highlight search matches
  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
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

  if (isLoading) {
    return (
      <section className="mt-10">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-3">
      {/* Section Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col gap-4">
          {/* Title and Refresh Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center space-x-2">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FiCalendar className="text-green-600 text-xl" />
                  </div>
                  <span>My Appointments</span>
                </h3>
                <div className="flex items-center space-x-4 text-slate-600">
                  <span>
                    {getUpcomingAppointments()} upcoming sessions •{" "}
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

              {/* Refresh Button - Mobile Responsive */}
              <div className="flex justify-center md:justify-end">
                <button
                  onClick={() => fetchAppointments(false)}
                  className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors duration-200 group flex items-center justify-center flex-shrink-0"
                  title="Refresh appointments"
                >
                  <FiRefreshCw className="text-slate-600 group-hover:rotate-180 transition-transform duration-300 text-lg" />
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
                  placeholder="Search by teacher, subject, or purpose..."
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
                  <FiSearch className="text-blue-600 font-medium text-2xl sm:text-lg" />
                  <span className="text-blue-800 font-medium">
                    {getSearchResultsCount() === 0
                      ? `No teachers found for "${searchTerm}"`
                      : `Found ${getSearchResultsCount()} teacher${
                          getSearchResultsCount() > 1 ? "s" : ""
                        } matching "${searchTerm}"`}
                  </span>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Upcoming Sessions Banner */}
      {getUpcomingAppointments() > 0 && filter === "all" && !searchTerm && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-2">
            <FiArrowUp className="text-green-600" />
            <span className="text-green-800 font-medium">
              Your upcoming sessions are shown first, sorted by nearest time
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
                ? "You haven't scheduled any appointments yet. Start by booking with a teacher above!"
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
            const isPastApproved =
              appointmentDate <= now && appt.status === "approved";

            return (
              <div
                key={appt._id}
                className={`group bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative ${
                  isUpcoming
                    ? "border-green-300 bg-gradient-to-r from-green-50/70 to-blue-50/70 ring-2 ring-green-100"
                    : isPastApproved
                    ? "border-orange-200 bg-gradient-to-r from-orange-50/50 to-white"
                    : "border-gray-100"
                }`}
              >
                {/* Priority Badge for Upcoming */}
                {isUpcoming && index < 3 && !searchTerm && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {index === 0 ? "Next" : `#${index + 1}`}
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Main Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center overflow-hidden relative flex-shrink-0">
                          {appt.teacher?.profile?.profilePicture ? (
                            <img
                              src={appt.teacher.profile.profilePicture}
                              alt={appt.teacher.name}
                              className="w-full h-full object-cover object-center rounded-full"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <span
                            className={`text-white font-bold absolute inset-0 flex items-center justify-center ${
                              appt.teacher?.profile?.profilePicture
                                ? "hidden"
                                : "flex"
                            }`}
                          >
                            {appt.teacher?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2) || "T"}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
                            <span>
                              {highlightText(
                                appt.teacher?.name || "Unknown Teacher",
                                searchTerm
                              )}
                            </span>
                            {isUpcoming && (
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            )}
                          </h4>
                          <p className="text-slate-600">
                            {highlightText(
                              appt.teacher?.subject || "Subject not specified",
                              searchTerm
                            )}
                          </p>
                          {/* Add department if available */}
                          {appt.teacher?.department && (
                            <p className="text-slate-500 text-sm">
                              {highlightText(
                                appt.teacher.department,
                                searchTerm
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <div className="flex items-center space-x-2 text-slate-600">
                        <FiCalendar
                          className={
                            isUpcoming ? "text-green-600" : "text-blue-600"
                          }
                        />
                        <span
                          className={`font-medium ${
                            isUpcoming ? "text-green-700" : ""
                          }`}
                        >
                          {appointmentDate.toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-600">
                        <FiClock
                          className={
                            isUpcoming ? "text-green-600" : "text-cyan-600"
                          }
                        />
                        <span
                          className={`font-medium ${
                            isUpcoming ? "text-green-700" : ""
                          }`}
                        >
                          {appointmentDate.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Purpose */}
                    {appt.purpose && (
                      <div className="flex items-start space-x-2 text-slate-600">
                        <FiMessageSquare className="text-orange-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm italic">
                          {highlightText(appt.purpose, searchTerm)}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        {/* Booking Type Indicator */}
                        {appt.bookingType && (
                          <div className="mt-2 flex items-center space-x-1">
                            <div
                              className={`px-2 py-1 rounded-md text-xs font-medium ${
                                appt.bookingType === "slot_booking"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {appt.bookingType === "slot_booking"
                                ? "Preset Slot"
                                : "Custom Request"}
                            </div>
                          </div>
                        )}

                        {/* Auto-update indicator */}
                        {appt.autoUpdated && (
                          <div className="mt-2 flex items-center space-x-1 text-xs text-slate-500">
                            <FiRefreshCw className="text-xs" />
                            <span>
                              Auto-updated on{" "}
                              {new Date(
                                appt.autoUpdatedAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        {/* Status Badge */}
                        <div className="flex flex-col items-end space-y-1">
                          <div
                            className={`inline-flex items-center space-x-1 px-2 py-1 rounded-xl border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}
                          >
                            <StatusIcon className="text-sm" />
                            <span className="font-medium text-sm">
                              {appt.status.charAt(0).toUpperCase() +
                                appt.status.slice(1)}
                            </span>
                          </div>

                          {/* Time Until Appointment */}
                          {isUpcoming && (
                            <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                              {getTimeUntilAppointment(appt.dateTime)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Stats */}
      {appointments.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {appointments.length}
            </div>
            <div className="text-slate-600 text-sm">Total Appointments</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {appointments.filter((a) => a.status === "pending").length}
            </div>
            <div className="text-slate-600 text-sm">Pending Requests</div>
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
            <div className="text-slate-600 text-sm">Completed Sessions</div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MyAppointments;
