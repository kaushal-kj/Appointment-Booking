import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import axios from "../services/axios";
import {
  AiOutlineMail,
  AiOutlineLock,
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from "react-icons/ai";
import { FiLogIn, FiAlertCircle, FiArrowLeft, FiUser } from "react-icons/fi";
import { showToast } from "../config/toastConfig";

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await axios.post("/auth/login", data);
      dispatch(loginSuccess(res.data));

      // Navigate based on role with success message
      const roleRoutes = {
        student: "/student/dashboard",
        teacher: "/teacher/dashboard",
        admin: "/admin/panel",
      };
      showToast.success("Login Successful");
      navigate(roleRoutes[res.data.role] || "/login");
    } catch (err) {
      showToast.error(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-16">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen py-8 px-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors duration-200 mb-6 group"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Back to Home</span>
          </Link>

          {/* Main Form Card */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiLogIn className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h2>
              <p className="text-slate-600">Sign in to continue your journey</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <AiOutlineMail className="absolute top-4 left-4 text-slate-400 text-xl" />
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Please enter a valid email",
                      },
                    })}
                    type="email"
                    placeholder="your.email@example.com"
                    className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                    <FiAlertCircle className="text-xs" />
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <AiOutlineLock className="absolute top-4 left-4 text-slate-400 text-xl" />
                  <input
                    {...register("password", {
                      required: "Password is required",
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible className="text-xl" />
                    ) : (
                      <AiOutlineEye className="text-xl" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                    <FiAlertCircle className="text-xs" />
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <FiLogIn />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2 text-sm">
                Demo Accounts
              </h4>
              <div className="text-xs text-orange-700 space-y-1">
                <div>Student: mark@student.com | Pass: mark123</div>
                <div>Teacher: smith@college.com | Pass: securepass</div>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center mt-6 pt-6 border-t border-slate-200">
              <p className="text-slate-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>

          {/* Quick Features */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/50">
              <FiUser className="text-blue-600 text-2xl mx-auto mb-2" />
              <div className="text-sm font-medium text-slate-700">
                Secure Login
              </div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/50">
              <FiLogIn className="text-cyan-600 text-2xl mx-auto mb-2" />
              <div className="text-sm font-medium text-slate-700">
                Quick Access
              </div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/50">
              <FiAlertCircle className="text-orange-600 text-2xl mx-auto mb-2" />
              <div className="text-sm font-medium text-slate-700">
                24/7 Support
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
