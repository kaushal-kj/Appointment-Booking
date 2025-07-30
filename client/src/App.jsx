import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminPanel from "./pages/AdminPanel";
import MessagingPage from "./pages/MessagingPage";
import { useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StudentProfile from "./pages/StudentProfile";
import TeacherProfile from "./pages/TeacherProfile";
import "./styles/toastStyles.css"

function App() {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  // role-based redirect path
  const redirectPath =
    role === "student"
      ? "/student/dashboard"
      : role === "teacher"
      ? "/teacher/dashboard"
      : role === "admin"
      ? "/admin/panel"
      : "/login";
  return (
    <BrowserRouter>
      {/* Only show navbar if authenticated */}
      {isAuthenticated && <Navbar />}

      <Routes>
        {/* Landing page is public */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to={redirectPath} /> : <LandingPage />
          }
        />

        {/* Auth routes */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? <LoginPage /> : <Navigate to={redirectPath} />
          }
        />
        <Route
          path="/register"
          element={
            !isAuthenticated ? <RegisterPage /> : <Navigate to={redirectPath} />
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        {/* Role-based dashboards */}
        <Route
          path="/student/dashboard"
          element={
            role === "student" ? <StudentDashboard /> : <Navigate to="/" />
          }
        />
        <Route
          path="/student/profile"
          element={
            role === "student" ? <StudentProfile /> : <Navigate to="/" />
          }
        />

        <Route
          path="/teacher/dashboard"
          element={
            role === "teacher" ? <TeacherDashboard /> : <Navigate to="/" />
          }
        />
        <Route
          path="/teacher/profile"
          element={
            role === "teacher" ? <TeacherProfile /> : <Navigate to="/" />
          }
        />
        <Route
          path="/admin/panel"
          element={role === "admin" ? <AdminPanel /> : <Navigate to="/" />}
        />

        {/* Messaging */}
        <Route
          path="/messages"
          element={
            isAuthenticated ? <MessagingPage /> : <Navigate to="/login" />
          }
        />
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        className="Toastify__toast-container"
        toastClassName="Toastify__toast"
        bodyClassName="Toastify__toast-body"
        progressClassName="Toastify__progress-bar"
      />
    </BrowserRouter>
  );
}

export default App;
