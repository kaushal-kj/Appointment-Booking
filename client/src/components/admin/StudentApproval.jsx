import { useEffect, useState, useRef } from "react";
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
  FiX,
} from "react-icons/fi";
import { showToast } from "../../config/toastConfig";

const StudentApproval = ({ refreshTrigger, onApproval }) => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchStudents = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const res = await axios.get("/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const pending = res.data.students.filter((s) => !s.isApproved);
      setStudents(pending);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const approve = async (id) => {
    try {
      await axios.put(
        `/admin/approve-student/${id}`,
        { isApproved: true },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      showToast.admin("Student approved successfully!");
      fetchStudents(false);
      if (onApproval) onApproval();
    } catch (error) {
      showToast.error(
        error.response?.data?.message || "Failed to approve student"
      );
    }
  };

  useEffect(() => {
    fetchStudents();

    // Auto-refresh every 30 seconds
    intervalRef.current = setInterval(() => {
      fetchStudents(false);
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshTrigger]);

  // Filter students based on search
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && students.length === 0) {
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
              <FiUserCheck className="text-orange-600" />
              <span>Pending Student Approvals</span>
              {students.length > 0 && (
                <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                  {students.length}
                </div>
              )}
            </h3>
            <div className="flex items-center space-x-4 text-slate-600">
              <span>{filteredStudents.length} students awaiting approval</span>
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
              {/* Enhanced search container */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center group-focus-within:shadow-lg transition-all duration-200">
                    <FiSearch className="w-3 h-3 text-white" />
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Search by name, email, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="
        w-full min-w-[250px] pl-12 pr-10 py-3.5
        border border-slate-200/80 rounded-2xl
        bg-gradient-to-br from-white via-orange-50/20 to-white
        text-slate-700 font-medium text-sm
        placeholder:text-slate-400
        focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400
        hover:border-slate-300 hover:shadow-lg hover:shadow-orange-100/50
        transition-all duration-300 ease-out
        backdrop-blur-sm
        shadow-sm
        group-hover:shadow-md
      "
                />

                {/* Clear button when there's text */}
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

            {/* Refresh Button */}
            <button
              onClick={() => fetchStudents()}
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors duration-200 group"
              title="Refresh list"
            >
              <FiRefreshCw className="text-slate-600 group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>
        </div>
        {/* Search Results Info */}
        {searchTerm && (
          <div className="mt-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
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

      {/* Students List */}
      <div className="space-y-4">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="text-2xl text-green-600" />
            </div>
            <h4 className="text-xl font-semibold text-slate-800 mb-2">
              All caught up!
            </h4>
            <p className="text-slate-600">
              {students.length === 0
                ? "No students are waiting for approval."
                : "No students match your search criteria."}
            </p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div
              key={student._id}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Student Info */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-slate-800 mb-1 flex items-center space-x-2">
                      <span>{student.name}</span>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    </h4>

                    <div className="flex items-center space-x-4 text-slate-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <FiMail className="text-sm" />
                        <span className="text-sm">{student.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-slate-500">
                      <div className="flex items-center space-x-1">
                        <FiCalendar className="text-xs" />
                        <span className="text-xs">
                          Registered:{" "}
                          {new Date(
                            student.createdAt || Date.now()
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiClock className="text-xs" />
                        <span className="text-xs">Pending approval</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="md:ml-6">
                  <button
                    onClick={() => approve(student._id)}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 hover:from-green-700 hover:to-green-800 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center space-x-2 w-full md:w-auto"
                  >
                    <FiCheckCircle />
                    <span>Approve Student</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bulk Actions */}
      {filteredStudents.length > 1 && (
        <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="text-orange-800 font-medium">
              Bulk Actions for {filteredStudents.length} students
            </div>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    `Approve all ${filteredStudents.length} students?`
                  )
                ) {
                  filteredStudents.forEach((student) => approve(student._id));
                }
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Approve All
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default StudentApproval;
