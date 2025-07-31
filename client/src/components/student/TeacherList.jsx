import { useState, useEffect } from "react";
import { showToast } from "../../config/toastConfig";
import axios from "../../services/axios";
import BookForm from "./BookForm";
import RateTeacher from "./RateTeacher";
import {
  FiUser,
  FiBook,
  FiMapPin,
  FiStar,
  FiClock,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiUsers,
  FiX,
  FiMail,
  FiRefreshCw, // Add refresh icon
  FiChevronDown,
} from "react-icons/fi";

const TeacherList = () => {
  const themeColor = "blue";
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null); // Add last updated state
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".relative")) {
        setDepartmentDropdownOpen(false);
      }
    };

    if (departmentDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [departmentDropdownOpen]);

  const fetchTeachers = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const res = await axios.get("/student/teachers");
      setTeachers(res.data);
      setLastUpdated(new Date()); // Set last updated time
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      showToast.error("Failed to load teachers");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Debug function to check if button click is working
  const handleBookClick = (teacher) => {
    setSelectedTeacher(teacher);
  };

  // Debug function to check if modal is closing properly
  const handleCloseModal = () => {
    setSelectedTeacher(null);
  };

  // Handle rating submission
  const handleRatingSubmitted = (action = "submitted") => {
    setShowRatingModal(null);

    // Show appropriate success message
    if (action === "updated") {
      showToast.student("Rating updated successfully!");
    } else {
      showToast.student("Rating submitted successfully!");
    }

    // Refresh teachers to update ratings
    fetchTeachers(false); // Don't show loading spinner for refresh
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchTeachers(false); // Fetch without loading spinner
    showToast.student("Teachers list refreshed!");
  };

  // Filter teachers based on search and department
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      filterDepartment === "all" || teacher.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Get unique departments for filter
  const departments = [
    ...new Set(teachers.map((teacher) => teacher.department)),
  ];

  if (isLoading) {
    return (
      <section className="mb-10">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mb-3">
        {/* Section Header */}
        <div className="sm:bg-white sm:rounded-2xl sm:p-6 sm:shadow-sm sm:border sm:border-gray-100 mb-6">
          <div className="flex flex-col gap-4">
            {/* Title and Refresh Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center space-x-2">
                    <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                      <FiUsers className="text-cyan-600 text-xl" />
                    </div>
                    <span>Find Teachers</span>
                  </h3>
                  <div className="flex items-center space-x-4 text-slate-600">
                    <span>
                      Connect with {filteredTeachers.length} expert educators
                    </span>
                    {lastUpdated && (
                      <span className="text-xs">
                        Updated:{" "}
                        {lastUpdated.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                          timeZone: "Asia/Kolkata",
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Refresh Button - Mobile Responsive */}
                <div className="flex justify-center md:justify-end">
                  <button
                    onClick={handleRefresh}
                    className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors duration-200 group flex items-center justify-center flex-shrink-0"
                    title="Refresh teachers list"
                  >
                    <FiRefreshCw className="text-slate-600 group-hover:rotate-180 transition-transform duration-300 text-lg" />
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center group-focus-within:shadow-md transition-all duration-200">
                      <FiSearch className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Search by name or subjects..."
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

              <div className="relative flex-1 sm:flex-none sm:w-64">
                <button
                  onClick={() =>
                    setDepartmentDropdownOpen(!departmentDropdownOpen)
                  }
                  className="w-full px-4 py-3 text-slate-700 hover:text-blue-600 font-medium transition-all duration-200 hover:bg-blue-50 rounded-xl flex items-center space-x-3 border border-slate-200 bg-white shadow-sm hover:shadow-md"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                    <FiFilter className="w-3 h-3 text-white" />
                  </div>
                  <span className="flex-1 text-left">
                    {filterDepartment === "all"
                      ? "All Departments"
                      : filterDepartment}
                  </span>
                  <FiChevronDown
                    className={`text-sm transition-transform duration-200 ${
                      departmentDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {departmentDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-blue-100 w-full min-w-[200px] overflow-hidden z-50">
                    <div className="py-2 max-h-60 overflow-y-auto">
                      <button
                        onClick={() => {
                          setFilterDepartment("all");
                          setDepartmentDropdownOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer text-left ${
                          filterDepartment === "all"
                            ? "bg-blue-50 text-blue-600"
                            : ""
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center ${
                            filterDepartment === "all"
                              ? "from-blue-100 to-blue-200 text-blue-600"
                              : "from-slate-100 to-slate-200 text-slate-500"
                          }`}
                        >
                          <FiUsers className="text-sm" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">All Departments</div>
                          <div className="text-xs text-slate-500">
                            View all teachers
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            filterDepartment === "all"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {teachers.length}
                        </span>
                      </button>

                      {departments.map((dept) => {
                        const deptCount = teachers.filter(
                          (t) => t.department === dept
                        ).length;
                        const isSelected = filterDepartment === dept;

                        return (
                          <button
                            key={dept}
                            onClick={() => {
                              setFilterDepartment(dept);
                              setDepartmentDropdownOpen(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer text-left ${
                              isSelected ? "bg-blue-50 text-blue-600" : ""
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center ${
                                isSelected
                                  ? "from-blue-100 to-blue-200 text-blue-600"
                                  : "from-slate-100 to-slate-200 text-slate-500"
                              }`}
                            >
                              <FiMapPin className="text-sm" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{dept}</div>
                              <div className="text-xs text-slate-500">
                                {deptCount} teacher
                                {deptCount !== 1 ? "s" : ""}
                              </div>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                isSelected
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {deptCount}
                            </span>
                          </button>
                        );
                      })}
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
                    {filteredTeachers.length === 0
                      ? `No teachers found for "${searchTerm}"`
                      : `Found ${filteredTeachers.length} teacher${
                          filteredTeachers.length > 1 ? "s" : ""
                        } matching "${searchTerm}"`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Teachers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher._id}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-bl-full opacity-50"></div>

              {/* Teacher Avatar */}
              <div className="relative z-10 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                  {teacher.profile?.profilePicture ? (
                    <img
                      src={teacher.profile.profilePicture}
                      alt={teacher.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <span
                    className={`text-white text-xl font-bold ${
                      teacher.profile?.profilePicture ? "hidden" : "flex"
                    } items-center justify-center`}
                    style={{
                      display: teacher.profile?.profilePicture
                        ? "none"
                        : "flex",
                    }}
                  >
                    {teacher.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)}
                  </span>
                </div>

                <h4 className="text-xl font-bold text-slate-800 mb-1">
                  {teacher.name}
                </h4>

                <div className="flex items-center space-x-2 text-slate-600 mb-2">
                  <FiBook className="text-sm" />
                  <span className="font-medium">{teacher.subject}</span>
                </div>

                <div className="flex items-center space-x-2 text-slate-500 mb-4">
                  <FiMapPin className="text-sm" />
                  <span className="text-sm">{teacher.department}</span>
                </div>

                {/* Rating Display */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    <FiStar className="text-orange-400 fill-current text-sm" />
                    <span className="text-sm font-medium text-slate-600">
                      {teacher.averageRating > 0
                        ? teacher.averageRating.toFixed(1)
                        : "No rating"}
                    </span>
                    {teacher.totalRatings > 0 && (
                      <span className="text-xs text-slate-400">
                        ({teacher.totalRatings})
                      </span>
                    )}
                  </div>
                  <div
                    className={`flex items-center space-x-1 ${
                      teacher.hasAvailableSlots
                        ? "text-green-600"
                        : "text-slate-400"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        teacher.hasAvailableSlots
                          ? "bg-green-500"
                          : "bg-slate-400"
                      }`}
                    ></div>
                    <span className="text-xs font-medium">
                      {teacher.hasAvailableSlots
                        ? `${teacher.availableSlotsCount} slots available`
                        : "No slots available"}
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {teacher.totalSessions || 0}
                    </div>
                    <div className="text-xs text-slate-600">Sessions</div>
                  </div>
                  <div className="bg-cyan-50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-cyan-600">
                      {teacher.profile?.experience || "N/A"}
                    </div>
                    <div className="text-xs text-slate-600">Years Exp</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 relative z-10">
                {/* Book Appointment Button */}
                <button
                  onClick={() => handleBookClick(teacher)}
                  type="button"
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg group-hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
                >
                  <FiCalendar />
                  <span>
                    {teacher.hasAvailableSlots
                      ? "Book Appointment"
                      : "Request Appointment"}
                  </span>
                </button>

                {/* Rate Teacher Button */}
                <button
                  onClick={() => setShowRatingModal(teacher)}
                  className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 py-2 px-4 rounded-xl transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2 group-hover:scale-105 active:scale-95"
                >
                  <FiStar className="text-sm" />
                  <span>Rate Teacher</span>
                </button>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredTeachers.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="text-2xl text-slate-400" />
            </div>
            <h4 className="text-xl font-semibold text-slate-800 mb-2">
              No teachers found
            </h4>
            <p className="text-slate-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </section>

      {/* Booking Form Modal */}
      {selectedTeacher && (
        <BookForm teacher={selectedTeacher} close={handleCloseModal} />
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full relative">
            {/* Close Button */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowRatingModal(null)}
                className="bg-white hover:bg-gray-100 text-gray-600 p-2 rounded-full shadow-lg transition-colors duration-200"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Rating Component */}
            <RateTeacher
              teacher={showRatingModal}
              onRatingSubmitted={handleRatingSubmitted}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherList;
