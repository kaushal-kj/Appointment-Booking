import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { showToast } from "../config/toastConfig";
import axios from "../services/axios";
import TeacherList from "../components/student/TeacherList";
import MyAppointments from "../components/student/MyAppointments";
import {
  FiCalendar,
  FiUsers,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiBook,
  FiStar,
  FiUser,
  FiRefreshCw,
  FiAlertCircle,
  FiMapPin,
  FiMail,
} from "react-icons/fi";
import { Element } from "react-scroll";

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    approvedAppointments: 0,
    availableTeachers: 0,
    monthlyChange: 0,
    recentAppointments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch real stats from API
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get("/student/stats", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.data.success) {
        setStats(response.data.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(response.data.message || "Failed to fetch stats");
      }
    } catch (error) {
      console.error("Failed to fetch student stats:", error);
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
  }, []);

  // Format monthly change display
  const getChangeDisplay = (change) => {
    if (change === 0)
      return { text: "No change", icon: null, color: "text-slate-500" };
    if (change > 0)
      return {
        text: `+${change}% this month`,
        icon: FiTrendingUp,
        color: "text-green-600",
      };
    return {
      text: `${change}% this month`,
      icon: FiTrendingDown,
      color: "text-red-600",
    };
  };

  // Alternative: More flexible academic year calculation
  const getFlexibleAcademicYear = (startMonth = 7) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11

    // Configurable start month (default: July = 6, August = 7)
    if (currentMonth < startMonth - 1) {
      return `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
    } else {
      return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
    }
  };

  const academicYearInfo = getFlexibleAcademicYear();

  const changeDisplay = getChangeDisplay(stats.monthlyChange);

  const statCards = [
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon: FiCalendar,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Pending Requests",
      value: stats.pendingAppointments,
      icon: FiClock,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: "Approved Sessions",
      value: stats.approvedAppointments,
      icon: FiStar,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Available Teachers",
      value: stats.availableTeachers,
      icon: FiUsers,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-600",
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
                  <div className="min-w-12 min-h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center">
                    <FiUser className="text-white text-2xl" />
                  </div>
                  <span>
                    Welcome back,{" "}
                    <span className="text-blue-600">
                      {user.name || "Student"}
                    </span>
                  </span>
                </h1>
                <p className="text-xl text-slate-600">
                  Ready to connect with your teachers today?
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="bg-white rounded-2xl px-6 py-3 shadow-sm border border-blue-100">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <FiBook className="text-blue-600" />
                    <span className="font-medium">
                      Academic Year: {academicYearInfo}
                    </span>
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
                  <div className="text-slate-600 font-medium">{stat.title}</div>
                  <div className="mt-2 flex items-center space-x-1">
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-300 h-4 w-20 rounded"></div>
                    ) : (
                      <>
                        {changeDisplay.icon && (
                          <changeDisplay.icon
                            className={`text-sm ${changeDisplay.color}`}
                          />
                        )}
                        <span
                          className={`text-sm font-medium ${changeDisplay.color}`}
                        >
                          {changeDisplay.text}
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
          <Element name="findTeachers">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <TeacherList />
            </div>
          </Element>

          <Element name="myAppointments">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-3">
              <MyAppointments onAppointmentUpdate={fetchStats} />
            </div>
          </Element>
          <Element name="contact">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 shadow-sm border border-purple-100">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FiMail className="text-white text-2xl" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-3">
                  Contact & Support
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Need help? Get in touch with us for any questions or support.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Email Support */}
                <div className="bg-white rounded-xl p-6 border border-purple-200 text-center">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FiMail className="text-blue-600 text-xl" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    Email Support
                  </h3>
                  <p className="text-blue-600 font-semibold text-lg mb-2">
                    educonnect57@gmail.com
                  </p>
                  <p className="text-slate-600">
                    We'll respond within 24 hours
                  </p>
                </div>

                {/* Company Address */}
                <div className="bg-white rounded-xl p-6 border border-purple-200 text-center">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FiMapPin className="text-purple-600 text-xl" />
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

export default StudentDashboard;
