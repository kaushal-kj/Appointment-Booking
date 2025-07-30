import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "../services/axios";
import {
  FiMail,
  FiArrowLeft,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiLock,
} from "react-icons/fi";

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      await axios.post("/auth/forgot-password", {
        email: data.email.toLowerCase().trim(),
      });

      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-3xl text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Email Sent!</h1>
              <p className="text-green-100 mt-2">Check your inbox</p>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-3">
                  Password Reset Link Sent
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  We've sent a password reset link to{" "}
                  <span className="font-medium text-slate-800">
                    {submittedEmail}
                  </span>
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <FiMail className="mr-2" />
                  Next Steps:
                </h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Check your email inbox</li>
                  <li>• Click the reset link (expires in 15 minutes)</li>
                  <li>• Create your new password</li>
                  <li>• Check spam folder if email doesn't arrive</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <FiArrowLeft />
                  <span>Back to Login</span>
                </Link>

                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setSubmittedEmail("");
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl font-medium transition-all duration-200"
                >
                  Try Different Email
                </button>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center mt-6">
            <p className="text-slate-600 text-sm">
              Didn't receive the email?{" "}
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setSubmittedEmail("");
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Forgot Password Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiLock className="text-3xl text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
            <p className="text-blue-100 mt-2">
              No worries, we'll help you reset it
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                  <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-800">Error</h4>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="text-center">
                <p className="text-slate-600 leading-relaxed">
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Please enter a valid email address",
                      },
                    })}
                    type="email"
                    placeholder="Enter your email address"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.email
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                    <FiAlertCircle className="flex-shrink-0" />
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                  isLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-105 active:scale-95"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <FiSend />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors duration-200"
              >
                <FiArrowLeft />
                <span>Back to Login</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-slate-600 text-sm">
            Having trouble?{" "}
            <Link
              to="/contact"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
