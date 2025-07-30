import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import axios from "../services/axios";
import {
  AiOutlineMail,
  AiOutlineLock,
  AiOutlineUser,
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from "react-icons/ai";
import {
  FiBookOpen,
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiShield,
  FiCheck,
} from "react-icons/fi";
import { showToast } from "../config/toastConfig";

function RegisterPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedRole = watch("role", "student");
  const watchPassword = watch("password", "");

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await axios.post("/auth/register", data);
      setSuccess(true);
      showToast.success("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      showToast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-16">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-green-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="text-white text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Registration Successful!
          </h2>
          <p className="text-slate-600 mb-4">
            Welcome to EduConnect. Redirecting to login...
          </p>
          <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-10">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
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
                <FiUsers className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                Join EduConnect
              </h2>
              <p className="text-slate-600">
                Create your account and start connecting
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name Field */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <AiOutlineUser className="absolute top-4 left-4 text-slate-400 text-xl" />
                  <input
                    {...register("name", { required: "Name is required" })}
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                    <FiAlertCircle className="text-xs" />
                    <span>{errors.name.message}</span>
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`
                    relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-200
                    ${
                      selectedRole === "student"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white/50 hover:border-slate-300"
                    }
                  `}
                  >
                    <input
                      {...register("role")}
                      type="radio"
                      value="student"
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center space-y-2">
                      <FiBookOpen
                        className={`text-2xl ${
                          selectedRole === "student"
                            ? "text-blue-600"
                            : "text-slate-400"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          selectedRole === "student"
                            ? "text-blue-600"
                            : "text-slate-600"
                        }`}
                      >
                        Student
                      </span>
                    </div>
                  </label>

                  <label
                    className={`
                    relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-200
                    ${
                      selectedRole === "teacher"
                        ? "border-cyan-500 bg-cyan-50"
                        : "border-slate-200 bg-white/50 hover:border-slate-300"
                    }
                  `}
                  >
                    <input
                      {...register("role")}
                      type="radio"
                      value="teacher"
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center space-y-2">
                      <FiUsers
                        className={`text-2xl ${
                          selectedRole === "teacher"
                            ? "text-cyan-600"
                            : "text-slate-400"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          selectedRole === "teacher"
                            ? "text-cyan-600"
                            : "text-slate-600"
                        }`}
                      >
                        Teacher
                      </span>
                    </div>
                  </label>
                </div>
              </div>

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

              {/* Password Field with One-Line Regex Validation */}
              <div className="relative">
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                  <span>Password</span>
                  <FiShield className="text-slate-500" />
                </label>
                <div className="relative">
                  <AiOutlineLock className="absolute top-4 left-4 text-slate-400 text-xl" />
                  <input
                    {...register("password", {
                      required: "Password is required",
                      validate: (password) =>
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/.test(
                          password
                        ) ||
                        "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a secure password"
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
                {watchPassword && (
                  <div className="mt-1">
                    {/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/.test(
                      watchPassword
                    ) ? (
                      <p className="text-green-600 text-sm flex items-center space-x-1">
                        <FiCheck className="text-2xl" />
                        <span>
                          Password meets all requirements - Strong password!
                        </span>
                      </p>
                    ) : (
                      <p className="text-red-500 text-sm flex items-center space-x-1">
                        <FiAlertCircle className="text-2xl" />
                        <span>
                          Password must be at least 8 characters with uppercase,
                          lowercase, number, and special character
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {/* Show form validation error only if no password is entered */}
                {errors.password && !watchPassword && (
                  <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                    <FiAlertCircle className="text-xs" />
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              {/* Conditional Fields for Teachers */}
              {selectedRole === "teacher" && (
                <div className="space-y-6 p-4 bg-cyan-50 rounded-xl border border-cyan-200">
                  <h3 className="font-semibold text-cyan-800 text-lg flex items-center space-x-2">
                    <FiUsers className="text-cyan-600" />
                    <span>Teacher Information</span>
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Department
                    </label>
                    <input
                      {...register("department")}
                      type="text"
                      placeholder="e.g., Computer Science"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Subject/Specialization
                    </label>
                    <input
                      {...register("subject")}
                      type="text"
                      placeholder="e.g., Data Structures, Mathematics"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create My Account</span>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6 pt-6 border-t border-slate-200">
              <p className="text-slate-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
