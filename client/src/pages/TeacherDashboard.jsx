import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { showToast } from "../config/toastConfig";
import axios from "../services/axios";
import TeacherAppointments from "../components/teacher/TeacherAppointments";
import UpdateAvailability from "../components/teacher/UpdateAvailability";
import {
  FiCalendar,
  FiUsers,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiCheckCircle,
  FiAlertCircle,
  FiStar,
  FiBook,
  FiRefreshCw,
  FiUser,
  FiMapPin,
  FiMail,
} from "react-icons/fi";
import { Element } from "react-scroll";

const TeacherDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingRequests: 0,
    approvedToday: 0,
    totalStudents: 0,
    weeklyChange: 0,
    approvedYesterday: 0,
    studentGrowth: 0,
    averageRating: 0,
    totalRatings: 0,
    subject: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Function to refresh appointments data
  const refreshAppointments = () => {
    setRefreshTrigger((prev) => prev + 1);
    fetchStats(); // Also refresh stats when appointments change
  };

  // Fetch real stats from API
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get("/teacher/stats", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.data.success) {
        setStats(response.data.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(response.data.message || "Failed to fetch stats");
      }
    } catch (error) {
      console.error("Failed to fetch teacher stats:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to load dashboard statistics";
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  // Format change display
  const getChangeDisplay = (change, type = "percentage") => {
    if (change === 0)
      return { text: "No change", icon: null, color: "text-slate-500" };
    if (change > 0)
      return {
        text:
          type === "percentage"
            ? `+${change}% this week`
            : `+${change} from yesterday`,
        icon: FiTrendingUp,
        color: "text-green-600",
      };
    return {
      text:
        type === "percentage"
          ? `${change}% this week`
          : `${change} from yesterday`,
      icon: FiTrendingDown,
      color: "text-red-600",
    };
  };

  const weeklyChangeDisplay = getChangeDisplay(stats.weeklyChange);
  const todayChangeDisplay = getChangeDisplay(
    stats.approvedToday - stats.approvedYesterday,
    "number"
  );
  const studentGrowthDisplay = getChangeDisplay(stats.studentGrowth);

  const statCards = [
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon: FiCalendar,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      change: weeklyChangeDisplay,
    },
    {
      title: "Pending Requests",
      value: stats.pendingRequests,
      icon: FiAlertCircle,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      change: {
        text: stats.pendingRequests > 0 ? "Need attention" : "All clear",
        icon: null,
        color: stats.pendingRequests > 0 ? "text-orange-600" : "text-green-600",
      },
    },
    {
      title: "Approved Today",
      value: stats.approvedToday,
      icon: FiCheckCircle,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      change: todayChangeDisplay,
    },
    {
      title: "Active Students",
      value: stats.totalStudents,
      icon: FiUsers,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-600",
      change: studentGrowthDisplay,
    },
  ];

  const handleRefreshStats = () => {
    showToast.info("Refreshing dashboard...");
    fetchStats();
  };

  return (
    <div className="pt-20 mt-3 pb-5 px-4 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Element name="welcome">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center space-x-3">
                  <div className="min-w-12 min-h-12 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl flex items-center justify-center">
                    <FiUser className="text-white text-2xl" />
                  </div>
                  <span>
                    Welcome,{" "}
                    <span className="text-blue-600">
                      Prof. {user?.name || "Educator"}
                    </span>
                  </span>
                </h1>
                <p className="text-xl text-slate-600">
                  Manage your schedule and connect with students
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                {/* Subject Card */}
                <div className="bg-white rounded-2xl px-6 py-3 shadow-sm border border-blue-100">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <FiBook className="text-blue-600" />
                    <span className="font-medium">
                      {isLoading ? (
                        <div className="animate-pulse bg-gray-300 h-4 w-20 rounded"></div>
                      ) : (
                        stats.subject || user?.subject || "Your Subject"
                      )}
                    </span>
                  </div>
                </div>

                {/* Rating Card */}
                <div className="bg-white rounded-2xl px-6 py-3 shadow-sm border border-cyan-100">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <FiStar className="text-cyan-600" />
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-300 h-4 w-16 rounded"></div>
                    ) : (
                      <span className="font-medium">
                        {stats.averageRating > 0 ? (
                          <>
                            {stats.averageRating} ⭐ ({stats.totalRatings}{" "}
                            {stats.totalRatings === 1 ? "review" : "reviews"})
                          </>
                        ) : (
                          "No ratings yet"
                        )}
                      </span>
                    )}
                  </div>
                </div>
                {lastUpdated && (
                  <div className="bg-white rounded-2xl px-6 py-3 shadow-sm border border-blue-100">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <FiRefreshCw className="text-blue-600" />
                      <span className="font-medium text-sm">
                        Updated:{" "}
                        {lastUpdated.toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                          timeZone: "Asia/Kolkata",
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
                <FiAlertCircle className="text-red-600" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-800">
                    Unable to load statistics
                  </h4>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
                <button
                  onClick={handleRefreshStats}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-6 shadow-sm border border-white/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      {isLoading ? (
                        <div className="animate-pulse bg-gray-300 w-6 h-6 rounded"></div>
                      ) : (
                        <stat.icon className={`text-xl ${stat.textColor}`} />
                      )}
                    </div>
                    <div className="text-right">
                      {isLoading ? (
                        <div className="animate-pulse bg-gray-300 h-8 w-12 rounded"></div>
                      ) : (
                        <div className="text-3xl font-bold text-slate-800">
                          {stat.value}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-slate-600 font-medium mb-2">
                    {stat.title}
                  </div>
                  <div className="flex items-center space-x-1">
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-300 h-4 w-20 rounded"></div>
                    ) : (
                      <>
                        {stat.change.icon && (
                          <stat.change.icon
                            className={`text-sm ${stat.change.color}`}
                          />
                        )}
                        <span
                          className={`text-xs font-medium ${stat.change.color}`}
                        >
                          {stat.change.text}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Refresh Button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={handleRefreshStats}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-slate-700 px-4 py-2 rounded-xl border border-gray-200 transition-colors duration-200 disabled:opacity-50"
              >
                <FiRefreshCw className={`${isLoading ? "animate-spin" : ""}`} />
                <span>Refresh Stats</span>
              </button>
            </div>
          </div>
        </Element>

        {/* Main Content */}
        <div className="space-y-8">
          <Element name="updateAvailability">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <UpdateAvailability onSlotAdded={refreshAppointments} />
            </div>
          </Element>

          <Element name="teacherAppointments">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <TeacherAppointments
                refreshTrigger={refreshTrigger}
                onStatusUpdate={refreshAppointments}
              />
            </div>
          </Element>
          <Element name="contact">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 shadow-sm border border-cyan-100">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FiMail className="text-white text-2xl" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-3">
                  Teacher Support Center
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  We're here to support your teaching journey. Contact us for
                  any assistance.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Email Support */}
                <div className="bg-white rounded-xl p-6 border border-cyan-200 text-center">
                  <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FiMail className="text-cyan-600 text-xl" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    Email Support
                  </h3>
                  <p className="text-cyan-600 font-semibold text-lg mb-2">
                    educonnect57@gmail.com
                  </p>
                  <p className="text-slate-600">
                    Priority support for teachers
                  </p>
                </div>

                {/* Company Address */}
                <div className="bg-white rounded-xl p-6 border border-cyan-200 text-center">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FiMapPin className="text-blue-600 text-xl" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    Our Location
                  </h3>
                  <div className="text-slate-600">
                    <p className="font-semibold mb-2">
                      EduConnect Teaching Center
                    </p>
                    <p>123 Education Boulevard</p>
                    <p>Knowledge District, ED 12345</p>
                    <p>United States</p>
                  </div>
                </div>
              </div>
            </div>
          </Element>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
