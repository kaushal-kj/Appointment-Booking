import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { logout } from "../redux/slices/authSlice";
import logo from "../assets/logo2.png";
import {
  FiMenu,
  FiMessageCircle,
  FiSettings,
  FiUser,
  FiX,
  FiUsers,
  FiUserPlus,
  FiBookOpen,
  FiUserCheck,
  FiChevronDown,
  FiBarChart2,
  FiCalendar,
  FiClock,
  FiSearch,
  FiUserPlus as FiTeacherAdd,
  FiPhone,
} from "react-icons/fi";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { role } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [quickNavOpen, setQuickNavOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setQuickNavOpen(false);
  };

  const toggleQuickNav = () => setQuickNavOpen(!quickNavOpen);

  // Close menus when clicking outside or on route change
  useEffect(() => {
    setIsOpen(false);
    setQuickNavOpen(false);
  }, [location.pathname]);

  // Check current page
  const isAdminPage = location.pathname === "/admin/panel";
  const isStudentPage = location.pathname === "/student/dashboard";
  const isTeacherPage = location.pathname === "/teacher/dashboard";

  // Quick navigation links for each role
  const getQuickNavLinks = () => {
    if (isAdminPage) {
      return [
        {
          to: "dashboard",
          label: "Dashboard",
          icon: FiBarChart2,
          color: "text-blue-600",
        },
        {
          to: "studentApproval",
          label: "Student Approval",
          icon: FiUserCheck,
          color: "text-orange-600",
        },
        {
          to: "studentList",
          label: "Student List",
          icon: FiUsers,
          color: "text-blue-600",
        },
        {
          to: "addTeacher",
          label: "Add Teacher",
          icon: FiUserPlus,
          color: "text-cyan-600",
        },
        {
          to: "teacherList",
          label: "Teacher List",
          icon: FiBookOpen,
          color: "text-cyan-600",
        },
      ];
    } else if (isStudentPage) {
      return [
        {
          to: "welcome",
          label: "Welcome",
          icon: FiUser,
          color: "text-blue-600",
        },
        {
          to: "findTeachers",
          label: "Find Teachers",
          icon: FiSearch,
          color: "text-cyan-600",
        },
        {
          to: "myAppointments",
          label: "My Appointments",
          icon: FiCalendar,
          color: "text-green-600",
        },
        {
          to: "contact",
          label: "Contact & Support",
          icon: FiPhone,
          color: "text-purple-600",
        },
      ];
    } else if (isTeacherPage) {
      return [
        {
          to: "welcome",
          label: "Welcome",
          icon: FiUser,
          color: "text-blue-600",
        },
        {
          to: "updateAvailability",
          label: "Availability",
          icon: FiClock,
          color: "text-cyan-600",
        },
        {
          to: "teacherAppointments",
          label: "Appointments",
          icon: FiCalendar,
          color: "text-green-600",
        },
        {
          to: "contact",
          label: "Contact & Support",
          icon: FiPhone,
          color: "text-purple-600",
        },
      ];
    }
    return [];
  };

  const quickNavLinks = getQuickNavLinks();
  const showQuickNav = quickNavLinks.length > 0;

  // Get theme color based on role
  const getThemeColor = () => {
    if (role === "admin") return "orange";
    if (role === "teacher") return "cyan";
    return "cyan"; // student default
  };

  const themeColor = getThemeColor();

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md shadow-lg py-3 px-4 md:py-4 md:px-6 fixed w-full top-0 z-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo - Mobile Responsive */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 hover: flex items-center justify-center">
              <img src={logo} />
            </div>
            <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              EduConnect
            </h1>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-xl text-blue-600 hover:text-blue-700 transition-colors duration-200 p-2 hover:bg-blue-50 rounded-lg"
            >
              {isOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {role === "student" && (
              <>
                <RouterLink
                  to="/student/dashboard"
                  className="px-4 py-2 text-slate-700 hover:text-cyan-600 font-medium transition-all duration-200 hover:bg-cyan-50 rounded-lg flex items-center space-x-2"
                >
                  <FiSettings className="text-sm" />
                  <span>Dashboard</span>
                </RouterLink>
                <RouterLink
                  to="/messages"
                  className="px-4 py-2 text-slate-700 hover:text-cyan-600 font-medium transition-all duration-200 hover:bg-cyan-50 rounded-lg flex items-center space-x-2"
                >
                  <FiMessageCircle className="text-sm" />
                  <span>Messages</span>
                </RouterLink>
                <RouterLink
                  to="/student/profile"
                  className="px-4 py-2 text-slate-700 hover:text-cyan-600 font-medium transition-all duration-200 hover:bg-cyan-50 rounded-lg flex items-center space-x-2"
                >
                  <FiUser />
                  <span>My Profile</span>
                </RouterLink>
              </>
            )}

            {role === "teacher" && (
              <>
                <RouterLink
                  to="/teacher/dashboard"
                  className="px-4 py-2 text-slate-700 hover:text-cyan-600 font-medium transition-all duration-200 hover:bg-cyan-50 rounded-lg flex items-center space-x-2"
                >
                  <FiSettings className="text-sm" />
                  <span>Dashboard</span>
                </RouterLink>
                <RouterLink
                  to="/messages"
                  className="px-4 py-2 text-slate-700 hover:text-cyan-600 font-medium transition-all duration-200 hover:bg-cyan-50 rounded-lg flex items-center space-x-2"
                >
                  <FiMessageCircle className="text-sm" />
                  <span>Messages</span>
                </RouterLink>
                <RouterLink
                  to="/teacher/profile"
                  className="px-4 py-2 text-slate-700 hover:text-cyan-600 font-medium transition-all duration-200 hover:bg-cyan-50 rounded-lg flex items-center space-x-2"
                >
                  <FiUser />
                  <span>My Profile</span>
                </RouterLink>
              </>
            )}

            {/* Universal Quick Navigation */}
            {showQuickNav && (
              <div className="relative">
                <button
                  onClick={toggleQuickNav}
                  className={`px-4 py-2 text-slate-700 hover:text-${themeColor}-600 font-medium transition-all duration-200 hover:bg-${themeColor}-50 rounded-lg flex items-center space-x-2`}
                >
                  <span>Quick Nav</span>
                  <FiChevronDown
                    className={`text-sm transition-transform duration-200 ${
                      quickNavOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {quickNavOpen && (
                  <div
                    className={`absolute top-full right-0 mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border-${themeColor}-100 min-w-56 overflow-hidden z-50`}
                  >
                    <div className="py-2">
                      {quickNavLinks.map((link) => {
                        const IconComponent = link.icon;
                        return (
                          <ScrollLink
                            key={link.to}
                            to={link.to}
                            spy={true}
                            smooth={true}
                            offset={-120}
                            duration={500}
                            className={`flex items-center space-x-3 px-4 py-3 text-slate-700 hover:text-${themeColor}-600 hover:bg-${themeColor}-50 transition-all duration-200 cursor-pointer`}
                            onClick={() => setQuickNavOpen(false)}
                          >
                            <IconComponent
                              className={`text-sm ${link.color}`}
                            />
                            <span className="font-medium">{link.label}</span>
                          </ScrollLink>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {role === null && (
              <>
                <div>
                  <RouterLink
                    to="/login"
                    className="px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-all duration-200 hover:bg-blue-50 rounded-lg"
                  >
                    Login
                  </RouterLink>
                  <RouterLink
                    to="/register"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                    Get Started
                  </RouterLink>
                </div>
              </>
            )}

            {role !== null && (
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-300 hover:from-orange-600 hover:to-orange-700 hover:shadow-md hover:scale-105 active:scale-95"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 top-16 bg-black/20 backdrop-blur-sm z-40"
          onClick={toggleMenu}
        >
          <div
            className="bg-white/95 backdrop-blur-md mx-4 mt-4 rounded-2xl shadow-2xl border border-blue-100 overflow-hidden max-h-[calc(100vh-6rem)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-4">
              {role === "student" && (
                <>
                  <RouterLink
                    to="/student/dashboard"
                    className="flex items-center space-x-3 px-6 py-4 text-slate-700 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-200"
                    onClick={toggleMenu}
                  >
                    <FiSettings className="text-lg" />
                    <span className="font-medium text-lg">Dashboard</span>
                  </RouterLink>
                  <RouterLink
                    to="/messages"
                    className="flex items-center space-x-3 px-6 py-4 text-slate-700 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-200"
                    onClick={toggleMenu}
                  >
                    <FiMessageCircle className="text-lg" />
                    <span className="font-medium text-lg">Messages</span>
                  </RouterLink>
                  <RouterLink
                    to="/student/profile"
                    className="flex items-center space-x-3 px-6 py-4 text-slate-700 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-200"
                  >
                    <FiUser />
                    <span className="font-medium text-lg">My Profile</span>
                  </RouterLink>
                </>
              )}

              {role === "teacher" && (
                <>
                  <RouterLink
                    to="/teacher/dashboard"
                    className="flex items-center space-x-3 px-6 py-4 text-slate-700 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-200"
                    onClick={toggleMenu}
                  >
                    <FiSettings className="text-lg" />
                    <span className="font-medium text-lg">Dashboard</span>
                  </RouterLink>
                  <RouterLink
                    to="/messages"
                    className="flex items-center space-x-3 px-6 py-4 text-slate-700 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-200"
                    onClick={toggleMenu}
                  >
                    <FiMessageCircle className="text-lg" />
                    <span className="font-medium text-lg">Messages</span>
                  </RouterLink>
                  <RouterLink
                    to="/teacher/profile"
                    className="flex items-center space-x-3 px-6 py-4 text-slate-700 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-200"
                  >
                    <FiUser />
                    <span className="font-medium text-lg">My Profile</span>
                  </RouterLink>
                </>
              )}

              {/* Mobile Quick Navigation for all roles */}
              {showQuickNav && (
                <>
                  <div className="border-t border-slate-200 my-2"></div>
                  <div className="px-6 py-3">
                    <span
                      className={`text-xs font-bold text-${themeColor}-600 uppercase tracking-wider`}
                    >
                      Quick Navigation
                    </span>
                  </div>
                  {quickNavLinks.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <ScrollLink
                        key={link.to}
                        to={link.to}
                        spy={true}
                        smooth={true}
                        offset={-120}
                        duration={500}
                        className={`flex items-center space-x-3 px-8 py-4 text-slate-700 hover:text-${themeColor}-600 hover:bg-${themeColor}-50 transition-all duration-200 cursor-pointer border-l-4 border-transparent hover:border-${themeColor}-300`}
                        onClick={toggleMenu}
                      >
                        <IconComponent className={`text-lg ${link.color}`} />
                        <span className="font-medium text-lg">
                          {link.label}
                        </span>
                      </ScrollLink>
                    );
                  })}
                </>
              )}

              {role === null && (
                <div className="px-4 py-2 space-y-3">
                  <RouterLink
                    to="/login"
                    className="block w-full text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 hover:text-blue-600 font-medium transition-all duration-200 hover:bg-blue-50 rounded-xl "
                    onClick={toggleMenu}
                  >
                    Login
                  </RouterLink>
                  <RouterLink
                    to="/register"
                    className="block w-full text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 "
                    onClick={toggleMenu}
                  >
                    Get Started
                  </RouterLink>
                </div>
              )}

              {/* Logout Button for Mobile */}
              {role !== null && (
                <div className="px-4 py-4 mt-4 border-t border-slate-200">
                  <button
                    onClick={() => {
                      toggleMenu();
                      handleLogout();
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:from-orange-600 hover:to-orange-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
