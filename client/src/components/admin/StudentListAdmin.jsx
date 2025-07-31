import { useEffect, useState, useRef } from "react";
import axios from "../../services/axios";
import {
  FiUsers,
  FiMail,
  FiCalendar,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiEdit3,
  FiUserCheck,
  FiUserX,
  FiEye,
  FiDownload,
  FiMoreVertical,
  FiTrash2,
  FiX,
  FiChevronDown,
  FiList,
  FiClock,
  FiAlertCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import { showToast } from "../../config/toastConfig";

const StudentListAdmin = ({ refreshTrigger, onStudentUpdate }) => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const fetchStudents = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);

      // Fetch students from your Student model
      const res = await axios.get("/admin/students", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setStudents(res.data.data || res.data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch students:", error);
      showToast.error("Failed to load students");
      setStudents([]); // Set empty array on error
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const updateStudentStatus = async (id, isApproved) => {
    try {
      const endpoint = isApproved
        ? `/admin/approve-student/${id}`
        : `/admin/suspend-student/${id}`;

      await axios.put(
        endpoint,
        { isApproved },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      showToast.admin(
        isApproved
          ? "Student approved successfully!"
          : "Student suspended successfully!"
      );

      fetchStudents(false);
      if (onStudentUpdate) onStudentUpdate();
    } catch (error) {
      console.error("Failed to update student status:", error);
      showToast.error(
        error.response?.data?.message || "Failed to update student status"
      );
    }
  };

  // delete student function
  const initiateDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/admin/student/${studentToDelete._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      showToast.admin(`${studentToDelete.name} has been deleted successfully`);
      fetchStudents(false);
      if (onStudentUpdate) onStudentUpdate();

      // Close modal and reset state
      setShowDeleteModal(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error("Failed to delete student:", error);
      showToast.error(
        error.response?.data?.message || "Failed to delete student"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  // Export students data
  const exportStudents = () => {
    try {
      const csvContent = [
        // CSV Headers
        [
          "Name",
          "Email",
          "Status",
          "Joined Date",
          "Course",
          "Year",
          "Student ID",
          "Total Appointments",
        ].join(","),
        // CSV Data
        ...filteredStudents.map((student) =>
          [
            student.name,
            student.email,
            student.isApproved ? "Active" : "Pending",
            new Date(student.createdAt).toLocaleDateString(),
            student.profile?.course || "N/A",
            student.profile?.year || "N/A",
            student.profile?.studentId || "N/A",
            student.stats?.totalAppointments || 0,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `students-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      showToast.admin("Student data exported successfully!");
    } catch (error) {
      showToast.error("Failed to export data");
    }
  };

  useEffect(() => {
    fetchStudents();

    // Auto-refresh every 60 seconds
    intervalRef.current = setInterval(() => {
      fetchStudents(false);
    }, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshTrigger]);

  // Filter students with better array handling
  const filteredStudents = Array.isArray(students)
    ? students.filter((student) => {
        const matchesSearch =
          (student.name &&
            student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (student.email &&
            student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (student.profile?.course &&
            student.profile.course
              .toLowerCase()
              .includes(searchTerm.toLowerCase()));
        const matchesStatus =
          filterStatus === "all" ||
          (filterStatus === "approved" && student.isApproved) ||
          (filterStatus === "pending" && !student.isApproved);
        return matchesSearch && matchesStatus;
      })
    : [];

  const formatAddress = (address) => {
    if (!address) return "N/A";
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  // Get status configuration
  const getStatusConfig = (isApproved) => {
    return isApproved
      ? {
          label: "Active",
          bgColor: "bg-green-100",
          textColor: "text-green-700",
          borderColor: "border-green-200",
          icon: FiUserCheck,
        }
      : {
          label: "Pending",
          bgColor: "bg-orange-100",
          textColor: "text-orange-700",
          borderColor: "border-orange-200",
          icon: FiUserX,
        };
  };

  if (isLoading && students.length === 0) {
    return (
      <section className="mb-10">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      {/* Mobile-Responsive Section Header */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6">
        <div className="space-y-4">
          {/* Title Section */}
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2 flex items-center space-x-2">
              <FiUsers className="text-blue-600" />
              <span>Student Management</span>
            </h3>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-slate-600 text-sm md:text-base">
              <span>
                {filteredStudents.length} of {students.length} students
              </span>
              <span className="hidden sm:inline">•</span>
              <span>{students.filter((s) => s.isApproved).length} active</span>
              <span className="hidden sm:inline">•</span>
              <span>
                {students.filter((s) => !s.isApproved).length} pending
              </span>
              {lastUpdated && (
                <>
                  <span className="hidden md:inline">•</span>
                  <span className="text-xs">
                    Updated:{" "}
                    {lastUpdated.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                      timeZone: "Asia/Kolkata",
                    })}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Controls Section - Mobile First Design */}
          <div className="space-y-3 md:space-y-0">
            {/* Filter and Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex gap-2 flex-col sm:flex-row">
                <div className="w-full md:w-auto">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center group-focus-within:shadow-md transition-all duration-200">
                        <FiSearch className="w-3 h-3 text-white" />
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Search by name, email, course, or student ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="
                        w-full min-w-[280px] pl-12 pr-10 py-3
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

                {/* Left Side - Filter */}
                <div className="flex gap-3">
                  <div className="relative flex-1 sm:flex-none sm:w-48">
                    <button
                      onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                      className="w-full px-4 py-3 text-slate-700 hover:text-blue-600 font-medium transition-all duration-200 hover:bg-blue-50 rounded-xl flex items-center space-x-3 border border-slate-200 bg-white shadow-sm hover:shadow-md"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                        <FiFilter className="w-3 h-3 text-white" />
                      </div>
                      <span className="flex-1 text-left">
                        {filterStatus === "all"
                          ? "All Status"
                          : filterStatus === "approved"
                          ? "Active"
                          : filterStatus === "pending"
                          ? "Pending"
                          : "All Status"}
                      </span>
                      <FiChevronDown
                        className={`text-sm transition-transform duration-200 ${
                          statusDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {statusDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-blue-100 w-full min-w-[200px] overflow-hidden z-50">
                        <div className="py-2">
                          <button
                            onClick={() => {
                              setFilterStatus("all");
                              setStatusDropdownOpen(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer text-left ${
                              filterStatus === "all"
                                ? "bg-blue-50 text-blue-600"
                                : ""
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center ${
                                filterStatus === "all"
                                  ? "from-blue-100 to-blue-200 text-blue-600"
                                  : "from-slate-100 to-slate-200 text-slate-500"
                              }`}
                            >
                              <FiList className="text-sm" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">All Status</div>
                              <div className="text-xs text-slate-500">
                                View all records
                              </div>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                filterStatus === "all"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {students.length}
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              setFilterStatus("approved");
                              setStatusDropdownOpen(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer text-left ${
                              filterStatus === "approved"
                                ? "bg-blue-50 text-blue-600"
                                : ""
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center ${
                                filterStatus === "approved"
                                  ? "from-green-100 to-green-200 text-green-600"
                                  : "from-slate-100 to-slate-200 text-slate-500"
                              }`}
                            >
                              <FiUserCheck className="text-sm" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Active</div>
                              <div className="text-xs text-slate-500">
                                Approved & active
                              </div>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                filterStatus === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {students.filter((t) => t.isApproved).length}
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              setFilterStatus("pending");
                              setStatusDropdownOpen(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer text-left ${
                              filterStatus === "pending"
                                ? "bg-blue-50 text-blue-600"
                                : ""
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center ${
                                filterStatus === "pending"
                                  ? "from-orange-100 to-orange-200 text-orange-600"
                                  : "from-slate-100 to-slate-200 text-slate-500"
                              }`}
                            >
                              <FiClock className="text-sm" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">Pending</div>
                              <div className="text-xs text-slate-500">
                                Awaiting approval
                              </div>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                filterStatus === "pending"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {students.filter((t) => !t.isApproved).length}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side - Action Buttons */}
              <div className="flex gap-3 justify-end">
                {/* Export Button */}
                <button
                  onClick={exportStudents}
                  className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-colors duration-200 flex-shrink-0"
                  title="Export data"
                >
                  <FiDownload />
                </button>

                {/* Refresh Button */}
                <button
                  onClick={() => fetchStudents()}
                  className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors duration-200 group flex-shrink-0"
                  title="Refresh list"
                >
                  <FiRefreshCw className="text-slate-600 group-hover:rotate-180 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
          {/* Search Results Info */}
          {searchTerm && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="flex items-center space-x-2">
                <FiSearch className="text-blue-600" />
                <span className="text-blue-800 font-medium">
                  {filteredStudents.length === 0
                    ? `No teachers found for "${searchTerm}"`
                    : `Found ${filteredStudents.length} teacher${
                        filteredStudents.length > 1 ? "s" : ""
                      } matching "${searchTerm}"`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-4">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUsers className="text-2xl text-slate-400" />
            </div>
            <h4 className="text-xl font-semibold text-slate-800 mb-2">
              No students found
            </h4>
            <p className="text-slate-600">
              {students.length === 0
                ? "No students have registered yet."
                : searchTerm
                ? `No students found matching "${searchTerm}". Try a different search term.`
                : "No students match your filter criteria."}
            </p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const statusConfig = getStatusConfig(student.isApproved);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={student._id}
                className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex flex-row-reverse items-center space-x-2 text-slate-600">
                      <div
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg border text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}
                      >
                        <StatusIcon className="text-xs" />
                        <span>{statusConfig.label}</span>
                      </div>
                    </div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        {/* Enhanced Student Avatar with Profile Picture */}
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center overflow-hidden relative">
                          {student.profile?.profilePicture ? (
                            <img
                              src={student.profile.profilePicture}
                              alt={student.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}

                          <span
                            className={`text-white font-bold text-lg absolute inset-0 flex items-center justify-center ${
                              student.profile?.profilePicture
                                ? "hidden"
                                : "flex"
                            }`}
                          >
                            {student.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2) || "S"}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xl font-bold text-slate-800 mb-1 flex items-center space-x-2">
                            <span>{student.name}</span>
                            {!student.isApproved && (
                              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                            )}
                          </h4>

                          <div className="flex items-center space-x-1 text-slate-600 mb-1">
                            <FiMail className="text-sm" />
                            <span className="text-sm">{student.email}</span>
                          </div>
                          {/* Course and Student ID */}
                          {student.profile && (
                            <div className="text-xs text-slate-500">
                              {student.profile.course && (
                                <span>{student.profile.course}</span>
                              )}
                              {student.profile.year && (
                                <span> • Year {student.profile.year}</span>
                              )}
                              {student.profile.studentId && (
                                <span> • ID: {student.profile.studentId}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Student Details */}
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-slate-600">
                        <FiCalendar className="text-blue-600" />
                        <div>
                          <div className="font-medium text-sm">Joined</div>
                          <div className="text-xs text-slate-500">
                            {new Date(student.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-slate-600">
                        <FiUsers className="text-cyan-600" />
                        <div>
                          <div className="font-medium text-sm">CGPA</div>
                          <div className="text-xs text-slate-500">
                            {student.profile?.cgpa || "N/A"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-slate-600">
                        <FiCalendar className="text-green-600" />
                        <div>
                          <div className="font-medium text-sm">Last Login</div>
                          <div className="text-xs">
                            {student.lastLogin ? (
                              <div className="space-y-1">
                                <div className="text-slate-700 font-medium">
                                  {new Date(
                                    student.lastLogin
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    timeZone: "Asia/Kolkata",
                                  })}
                                </div>
                                <div className="text-slate-400">
                                  {(() => {
                                    const now = new Date();
                                    const loginDate = new Date(
                                      student.lastLogin
                                    );
                                    const diffInMinutes = Math.floor(
                                      (now - loginDate) / (1000 * 60)
                                    );
                                    const diffInHours = Math.floor(
                                      diffInMinutes / 60
                                    );
                                    const diffInDays = Math.floor(
                                      diffInHours / 24
                                    );

                                    if (diffInMinutes < 60) {
                                      return diffInMinutes < 1
                                        ? "Just now"
                                        : `${diffInMinutes}m ago`;
                                    } else if (diffInHours < 24) {
                                      return `${diffInHours}h ago`;
                                    } else if (diffInDays < 7) {
                                      return diffInDays === 1
                                        ? "Yesterday"
                                        : `${diffInDays} days ago`;
                                    } else if (diffInDays < 30) {
                                      const weeks = Math.floor(diffInDays / 7);
                                      return `${weeks} week${
                                        weeks > 1 ? "s" : ""
                                      } ago`;
                                    } else {
                                      const months = Math.floor(
                                        diffInDays / 30
                                      );
                                      return `${months} month${
                                        months > 1 ? "s" : ""
                                      } ago`;
                                    }
                                  })()}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="text-orange-600 font-medium text-xs">
                                  Never logged in
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {student.stats?.totalAppointments || 0}
                        </div>
                        <div className="text-xs text-slate-600">
                          Appointments
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-green-600">
                          {student.stats?.completedSessions || 0}
                        </div>
                        <div className="text-xs text-slate-600">Completed</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-orange-600">
                          {student.stats?.pendingRequests || 0}
                        </div>
                        <div className="text-xs text-slate-600">Pending</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:w-56 flex flex-col justify-center space-y-3">
                    {/* View Profile Button */}
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowProfileModal(true);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <FiEye className="text-sm" />
                      <span>View Profile</span>
                    </button>

                    {/* Status Toggle */}
                    {student.isApproved ? (
                      <button
                        onClick={() => updateStudentStatus(student._id, false)}
                        className="bg-orange-100 hover:bg-orange-200 text-orange-700 py-2 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <FiUserX className="text-sm" />
                        <span>Suspend</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStudentStatus(student._id, true)}
                        className="bg-green-100 hover:bg-green-200 text-green-700 py-2 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <FiUserCheck className="text-sm" />
                        <span>Approve</span>
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={() => initiateDelete(student)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <FiTrash2 className="text-sm" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Profile Modal */}
      {/* Profile Modal - Enhanced Activity Section */}
      {showProfileModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-slate-800">
                Student Profile
              </h3>
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setSelectedStudent(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="text-xl text-slate-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Student Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center overflow-hidden">
                  {selectedStudent.profile?.profilePicture ? (
                    <img
                      src={selectedStudent.profile.profilePicture}
                      alt={selectedStudent.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-xl">
                      {selectedStudent.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-slate-800">
                    {selectedStudent.name}
                  </h4>
                  <p className="text-slate-600">{selectedStudent.email}</p>
                  <div
                    className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium mt-1 ${
                      selectedStudent.isApproved
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {selectedStudent.isApproved ? "Active" : "Pending Approval"}
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-slate-800 mb-3">
                    Personal Information
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Student ID:</span>{" "}
                      {selectedStudent.profile?.studentId || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Course:</span>{" "}
                      {selectedStudent.profile?.course || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Year:</span>{" "}
                      {selectedStudent.profile?.year || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">CGPA:</span>{" "}
                      {selectedStudent.profile?.cgpa || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedStudent.profile?.phone || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Address:</span>{" "}
                      {selectedStudent.profile?.address || "N/A"}
                    </div>
                  </div>
                </div>

                {/* Enhanced Activity Section */}
                <div>
                  <h5 className="font-semibold text-slate-800 mb-3">
                    Activity & Statistics
                  </h5>
                  <div className="space-y-3 text-sm">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <div className="font-medium text-slate-700 mb-1">
                        Account Created
                      </div>
                      <div className="text-slate-600">
                        {new Date(selectedStudent.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            timeZone: "Asia/Kolkata",
                          }
                        )}
                      </div>
                    </div>

                    <div
                      className={`p-3 rounded-lg ${
                        selectedStudent.lastLogin
                          ? "bg-green-50"
                          : "bg-orange-50"
                      }`}
                    >
                      <div className="font-medium text-slate-700 mb-1">
                        Last Login
                      </div>
                      {selectedStudent.lastLogin ? (
                        <div>
                          <div className="text-slate-600">
                            {new Date(
                              selectedStudent.lastLogin
                            ).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              timeZone: "Asia/Kolkata",
                            })}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {new Date(
                              selectedStudent.lastLogin
                            ).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                              timeZone: "Asia/Kolkata",
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-orange-600 font-medium">
                          Never logged in since tracking started
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="font-medium text-slate-700 mb-1">
                        Appointment Stats
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-bold text-blue-600">
                            {selectedStudent.stats?.totalAppointments || 0}
                          </div>
                          <div className="text-slate-500">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-green-600">
                            {selectedStudent.stats?.completedSessions || 0}
                          </div>
                          <div className="text-slate-500">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-orange-600">
                            {selectedStudent.stats?.pendingRequests || 0}
                          </div>
                          <div className="text-slate-500">Pending</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedStudent.profile?.bio && (
                <div className="mt-6">
                  <h5 className="font-semibold text-slate-800 mb-2">Bio</h5>
                  <p className="text-sm text-slate-600 bg-gray-50 p-3 rounded-lg">
                    {selectedStudent.profile.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <FiAlertCircle className="text-red-600 text-lg" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  Delete Student
                </h3>
              </div>
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <FiX className="text-xl text-slate-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-slate-600 mb-4">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-800">
                    {studentToDelete.name}
                  </span>
                  ?
                </p>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FiAlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-800 mb-1">
                        This action cannot be undone
                      </h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• All student data will be permanently deleted</li>
                        <li>• All associated appointments will be removed</li>
                        <li>• Student's academic records will be lost</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Student Info Summary */}
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {studentToDelete.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">
                        {studentToDelete.name}
                      </div>
                      <div className="text-sm text-slate-600">
                        {studentToDelete.email}
                      </div>
                      <div className="text-sm text-slate-500">
                        {studentToDelete.profile?.course && (
                          <span>{studentToDelete.profile.course}</span>
                        )}
                        {studentToDelete.profile?.year && (
                          <span> • Year {studentToDelete.profile.year}</span>
                        )}
                        {studentToDelete.profile?.studentId && (
                          <span>
                            {" "}
                            • ID: {studentToDelete.profile.studentId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="text-sm" />
                      <span>Delete Student</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default StudentListAdmin;
