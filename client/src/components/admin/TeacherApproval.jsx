import { useEffect, useState, useRef } from "react";
import { showToast } from "../../config/toastConfig";
import axios from "../../services/axios";
import {
  FiUserCheck,
  FiMail,
  FiCalendar,
  FiRefreshCw,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiBookOpen,
  FiMapPin,
  FiX,
} from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";

const TeacherApproval = ({ refreshTrigger, onApproval }) => {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchTeachers = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);

      // Fetch teachers using the same endpoint structure as students
      const res = await axios.get("/admin/teachers", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Filter only pending teachers (not approved)
      const teachersData = res.data.data || res.data || [];
      const pending = teachersData.filter((t) => !t.isApproved);
      setTeachers(pending);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      showToast.error("Failed to load pending teachers");
      setTeachers([]);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const approve = async (id) => {
    try {
      await axios.put(
        `/admin/approve-teacher/${id}`,
        { isApproved: true },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      showToast.admin("Teacher approved successfully!");
      fetchTeachers(false);
      if (onApproval) onApproval();
    } catch (error) {
      console.error("Failed to approve teacher:", error);
      showToast.error(
        error.response?.data?.message || "Failed to approve teacher"
      );
    }
  };

  useEffect(() => {
    fetchTeachers();

    // Auto-refresh every 30 seconds
    intervalRef.current = setInterval(() => {
      fetchTeachers(false);
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshTrigger]);

  // Filter teachers based on search
  const filteredTeachers = Array.isArray(teachers)
    ? teachers.filter(
        (teacher) =>
          (teacher.name &&
            teacher.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (teacher.email &&
            teacher.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (teacher.subject &&
            teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (teacher.department &&
            teacher.department.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  if (isLoading && teachers.length === 0) {
    return (
      <section className="mb-10">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center space-x-2">
              <FaGraduationCap className="text-blue-600" />
              <span>Pending Teacher Approvals</span>
              {teachers.length > 0 && (
                <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                  {teachers.length}
                </div>
              )}
            </h3>
            <div className="flex items-center space-x-4 text-slate-600">
              <span>{filteredTeachers.length} teachers awaiting approval</span>
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

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative group">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center group-focus-within:shadow-md transition-all duration-200">
                  <FiSearch className="w-3 h-3 text-white" />
                </div>
              </div>

              <input
                type="text"
                placeholder="Search by name, email, subject, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
      w-full min-w-[250px] pl-12 pr-10 py-3
      border border-slate-200 rounded-2xl
      bg-white
      text-slate-700 font-medium text-sm
      placeholder:text-slate-400
      focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500
      hover:border-slate-300 hover:shadow-sm
      transition-all duration-200
      shadow-sm
    "
              />

              {/* Clear button */}
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                  title="Clear search"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchTeachers()}
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors duration-200 group"
              title="Refresh list"
            >
              <FiRefreshCw className="text-slate-600 group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>
        </div>
        {/* Search Results Info */}
        {searchTerm && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl mt-2 p-3">
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

      {/* Teachers List */}
      <div className="space-y-4">
        {filteredTeachers.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="text-2xl text-green-600" />
            </div>
            <h4 className="text-xl font-semibold text-slate-800 mb-2">
              All caught up!
            </h4>
            <p className="text-slate-600">
              {teachers.length === 0
                ? "No teachers are waiting for approval."
                : "No teachers match your search criteria."}
            </p>
          </div>
        ) : (
          filteredTeachers.map((teacher) => (
            <div
              key={teacher._id}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Teacher Info */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center overflow-hidden">
                    {teacher.profile?.profilePicture ? (
                      <img
                        src={teacher.profile.profilePicture}
                        alt={teacher.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}

                    <span
                      className={`text-white font-bold text-lg absolute inset-0 flex items-center justify-center ${
                        teacher.profile?.profilePicture ? "hidden" : "flex"
                      }`}
                    >
                      {teacher.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2) || "T"}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-slate-800 mb-1 flex items-center space-x-2">
                      <span>{teacher.name}</span>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </h4>

                    <div className="flex flex-wrap items-center gap-4 text-slate-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <FiMail className="text-sm" />
                        <span className="text-sm">{teacher.email}</span>
                      </div>

                      {teacher.subject && (
                        <div className="flex items-center space-x-1">
                          <FiBookOpen className="text-sm text-blue-600" />
                          <span className="text-sm">{teacher.subject}</span>
                        </div>
                      )}

                      {teacher.department && (
                        <div className="flex items-center space-x-1">
                          <FiMapPin className="text-sm text-cyan-600" />
                          <span className="text-sm">{teacher.department}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-slate-500">
                      <div className="flex items-center space-x-1">
                        <FiCalendar className="text-xs" />
                        <span className="text-xs">
                          Applied:{" "}
                          {new Date(
                            teacher.createdAt || Date.now()
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiClock className="text-xs" />
                        <span className="text-xs">Pending approval</span>
                      </div>
                      {teacher.profile?.experience && (
                        <div className="flex items-center space-x-1">
                          <FiUser className="text-xs" />
                          <span className="text-xs">
                            {teacher.profile.experience} years exp.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="md:ml-6">
                  <button
                    onClick={() => approve(teacher._id)}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:from-green-700 hover:to-green-800 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center space-x-2 w-full md:w-auto"
                  >
                    <FiCheckCircle />
                    <span>Approve Teacher</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bulk Actions */}
      {filteredTeachers.length > 1 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="text-blue-800 font-medium">
              Bulk Actions for {filteredTeachers.length} teachers
            </div>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    `Approve all ${filteredTeachers.length} teachers?`
                  )
                ) {
                  filteredTeachers.forEach((teacher) => approve(teacher._id));
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Approve All
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default TeacherApproval;
