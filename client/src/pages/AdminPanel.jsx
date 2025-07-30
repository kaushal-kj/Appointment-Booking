import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { showToast } from "../config/toastConfig";
import axios from "../services/axios"; // Add axios import
import { Element } from "react-scroll";
import AddTeacher from "../components/admin/AddTeacher";
import StudentApproval from "../components/admin/StudentApproval";
import TeacherListAdmin from "../components/admin/TeacherListAdmin";
import StudentListAdmin from "../components/admin/StudentListAdmin";
import {
  FiShield,
  FiUsers,
  FiUserCheck,
  FiBookOpen,
  FiCalendar,
  FiActivity,
  FiTrendingUp,
  FiRefreshCw, // Add refresh icon
} from "react-icons/fi";
import TeacherApproval from "../components/admin/TeacherApproval";

const AdminPanel = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingApprovals: 0,
    totalTeachers: 0,
    totalAppointments: 0,
    approvedStudents: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    activeTeachers: 0,
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch real dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await axios.get("/admin/dashboard-stats", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.success) {
        setStats(response.data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      showToast.error("Failed to load dashboard statistics");
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Function to refresh data across components
  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
    fetchDashboardStats(); // Refresh stats when data changes
  };

  // Manual refresh function
  const handleRefreshStats = () => {
    fetchDashboardStats();
    showToast.admin("Dashboard refreshed!");
  };

  // Fetch stats on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchDashboardStats();
  }, [refreshTrigger]);

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: FiUsers,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      change: `${stats.approvedStudents} approved`,
      trend: "up",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: FiUserCheck,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      change:
        stats.pendingApprovals > 0
          ? `${stats.breakdown?.pendingStudents || 0} students • ${
              stats.breakdown?.pendingTeachers || 0
            } teachers`
          : "All cleared",
      urgent: stats.pendingApprovals > 0,
      trend: stats.pendingApprovals > 5 ? "up" : "stable",
    },
    {
      title: "Active Teachers",
      value: stats.activeTeachers || stats.totalTeachers,
      icon: FiBookOpen,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-600",
      change: `${stats.totalTeachers} total`,
      trend: "up",
    },
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon: FiCalendar,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      change: `${stats.completedAppointments || 0} completed`,
      trend: "up",
    },
  ];

  return (
    <div className="pt-16 mt-2 pb-5 md:pt-20 px-3 md:px-4 bg-gradient-to-br from-gray-50 to-orange-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Element name="dashboard">
          <div className="mb-6 md:mb-8">
            <div className="text-center md:text-left mb-4 md:mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center justify-center md:justify-start space-x-3 mb-3 md:mb-0">
                  <div className="min-w-10 min-h-10 md:w-12 md:h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center">
                    <FiShield className="text-white text-xl md:text-2xl" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-4xl font-bold text-slate-800">
                      Admin Control Center
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 hidden md:block">
                      Manage users, oversee platform operations
                    </p>
                  </div>
                </div>

                {/* Refresh Button and Last Updated */}
                <div className="flex flex-col items-center md:items-end space-y-2">
                  <button
                    onClick={handleRefreshStats}
                    disabled={isLoadingStats}
                    className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-slate-600 px-4 py-2 rounded-xl border border-slate-200 transition-colors duration-200 disabled:opacity-50"
                  >
                    <FiRefreshCw
                      className={`text-sm ${
                        isLoadingStats ? "animate-spin" : ""
                      }`}
                    />
                    <span className="text-sm font-medium">
                      {isLoadingStats ? "Refreshing..." : "Refresh"}
                    </span>
                  </button>
                  {lastUpdated && (
                    <span className="text-xs text-slate-500">
                      Updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-base text-slate-600 px-4 md:px-0 md:hidden mt-2">
                Manage users, oversee platform operations
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
              {statCards.map((stat, index) => (
                <div
                  key={index}
                  className={`group bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-white/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative ${
                    stat.urgent ? "ring-2 ring-orange-200" : ""
                  } ${isLoadingStats ? "animate-pulse" : ""}`}
                >
                  {/* Loading State */}
                  {isLoadingStats ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-200 rounded-lg"></div>
                        <div className="w-12 h-6 bg-gray-200 rounded"></div>
                      </div>
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      <div className="w-16 h-3 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 md:mb-4">
                        <div
                          className={`w-8 h-8 md:w-12 md:h-12 ${stat.bgColor} rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-2 md:mb-0`}
                        >
                          <stat.icon
                            className={`text-lg md:text-xl ${stat.textColor}`}
                          />
                        </div>
                        <div className="text-right md:text-right">
                          <div
                            className={`text-xl md:text-3xl font-bold text-slate-800 ${
                              stat.urgent ? "text-orange-600" : ""
                            }`}
                          >
                            {stat.value}
                          </div>
                        </div>
                      </div>
                      <div className="text-slate-600 font-medium text-sm md:text-base mb-1 md:mb-2">
                        {stat.title}
                      </div>
                      <div className="flex items-center justify-between">
                        <div
                          className={`text-xs ${
                            stat.urgent
                              ? "text-orange-600 font-semibold"
                              : "text-slate-500"
                          }`}
                        >
                          {stat.change}
                        </div>
                        {/* Trend Indicator */}
                        <div className="flex items-center space-x-1">
                          {stat.trend === "up" && (
                            <FiTrendingUp className="text-green-500 text-xs" />
                          )}
                          {stat.urgent && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Urgent Badge */}
                  {stat.urgent && !isLoadingStats && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      !
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Element>

        {/* Main Content */}
        <div className="space-y-6 md:space-y-8">
          <Element name="studentApproval">
            <StudentApproval
              refreshTrigger={refreshTrigger}
              onApproval={refreshData}
            />
          </Element>

          <Element name="teacherApproval">
            <TeacherApproval
              refreshTrigger={refreshTrigger}
              onApproval={refreshData}
            />
          </Element>

          <Element name="studentList">
            <StudentListAdmin
              refreshTrigger={refreshTrigger}
              onStudentUpdate={refreshData}
            />
          </Element>

          <Element name="addTeacher">
            <AddTeacher onTeacherAdded={refreshData} />
          </Element>

          <Element name="teacherList">
            <TeacherListAdmin
              refreshTrigger={refreshTrigger}
              onTeacherRemoved={refreshData}
            />
          </Element>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
