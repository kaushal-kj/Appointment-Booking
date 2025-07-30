import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "../../services/axios";
import {
  FiUserPlus,
  FiUser,
  FiMail,
  FiLock,
  FiBookOpen,
  FiMapPin,
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiCopy,
  FiPhone,
} from "react-icons/fi";
import { showToast } from "../../config/toastConfig";

const AddTeacher = ({ onTeacherAdded }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);

  // Watch password field for strength indicator
  const watchPassword = watch("password");

  // Generate random password
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue("password", password);
    showToast.info("🔐 Secure password generated!");
  };


  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password)
      return { strength: 0, label: "No password", color: "bg-gray-200" };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { strength: 0, label: "Very Weak", color: "bg-red-500" },
      { strength: 1, label: "Weak", color: "bg-orange-500" },
      { strength: 2, label: "Fair", color: "bg-yellow-500" },
      { strength: 3, label: "Good", color: "bg-blue-500" },
      { strength: 4, label: "Strong", color: "bg-green-500" },
      { strength: 5, label: "Very Strong", color: "bg-green-600" },
    ];

    return levels[score];
  };

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const response = await axios.post("/admin/teacher", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        // Simple success toast
        showToast.admin("Teacher added successfully!");

        // Set success state
        setSuccess(true);

        // Store credentials
        setGeneratedCredentials({
          email: data.email,
          password: data.password,
          name: data.name,
        });

        // Clear form
        reset({
          name: "",
          email: "",
          password: "",
          department: "",
          subject: "",
          phone: "",
        });

        // Call parent callback
        if (onTeacherAdded) {
          onTeacherAdded();
        }

        // Auto-hide success after 5 seconds
        setTimeout(() => {
          setSuccess(false);
          setGeneratedCredentials(null);
        }, 5000);
      }

      if (onTeacherAdded) onTeacherAdded();
    } catch (error) {
      if (error.response?.status === 200 || error.response?.status === 201) {
        showToast.admin("Teacher added successfully!");

        // Clear form
        reset();
        setTimeout(() => {
          setValue("name", "");
          setValue("email", "");
          setValue("password", "");
          setValue("department", "");
          setValue("subject", "");
          setValue("phone", "");
          setShowPassword(false);
        }, 200);

        if (onTeacherAdded) onTeacherAdded();
      } else {
        // Actual error
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to add teacher";

        showToast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(watchPassword);

  return (
    <section className="mb-10">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
              <FiUserPlus className="text-cyan-600" />
              <span>Add New Teacher</span>
            </h3>
            <p className="text-slate-600 mt-1">
              Create a new teacher account with secure credentials
            </p>
          </div>

          {success && (
            <div className="bg-green-100 border border-green-200 rounded-xl p-3 flex items-center space-x-2 animate-in fade-in-50 duration-300">
              <FiCheckCircle className="text-green-600" />
              <span className="text-green-700 font-medium text-sm">
                Teacher added successfully!
              </span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div>
              <label className=" text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                <FiUser className="text-cyan-600" />
                <span>Full Name *</span>
              </label>
              <input
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                type="text"
                placeholder="Enter teacher's full name"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                  <FiAlertCircle className="text-xs" />
                  <span>{errors.name.message}</span>
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className=" text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                <FiMail className="text-cyan-600" />
                <span>Email Address *</span>
              </label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                })}
                type="email"
                placeholder="teacher@institution.edu"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                  <FiAlertCircle className="text-xs" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Password Field with Generator */}
            <div>
              <label className=" text-sm font-semibold text-slate-700 mb-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiLock className="text-cyan-600" />
                  <span>Password *</span>
                </div>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="text-xs text-cyan-600 hover:text-cyan-700 flex items-center space-x-1"
                >
                  <FiRefreshCw className="text-xs" />
                  <span>Generate</span>
                </button>
              </label>
              <div className="relative">
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create secure password"
                  className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {watchPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">
                      Password strength
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength.strength >= 3
                          ? "text-green-600"
                          : passwordStrength.strength >= 2
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                  <FiAlertCircle className="text-xs" />
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Phone Field (Optional) */}
            <div>
              <label className=" text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                <FiPhone className="text-cyan-600" />
                <span>Phone Number</span>
                <span className="text-xs text-slate-500">(Optional)</span>
              </label>
              <input
                {...register("phone", {
                  pattern: {
                    value: /^[\+]?[1-9][\d]{0,15}$/,
                    message: "Please enter a valid phone number",
                  },
                })}
                type="tel"
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                  <FiAlertCircle className="text-xs" />
                  <span>{errors.phone.message}</span>
                </p>
              )}
            </div>

            {/* Department Field */}
            <div>
              <label className=" text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                <FiMapPin className="text-cyan-600" />
                <span>Department *</span>
              </label>
              <select
                {...register("department", {
                  required: "Department is required",
                })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
                <option value="History">History</option>
                <option value="Economics">Economics</option>
                <option value="Psychology">Psychology</option>
                <option value="Engineering">Engineering</option>
                <option value="Business">Business</option>
                <option value="Other">Other</option>
              </select>
              {errors.department && (
                <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                  <FiAlertCircle className="text-xs" />
                  <span>{errors.department.message}</span>
                </p>
              )}
            </div>

            {/* Subject Field */}
            <div className="md:col-span-2">
              <label className=" text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                <FiBookOpen className="text-cyan-600" />
                <span>Subject/Specialization *</span>
              </label>
              <input
                {...register("subject", { required: "Subject is required" })}
                type="text"
                placeholder="e.g., Data Structures, Machine Learning, Calculus"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                  <FiAlertCircle className="text-xs" />
                  <span>{errors.subject.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading || Object.keys(errors).length > 0}
              className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white py-3 px-8 rounded-xl font-semibold transition-all duration-300 hover:from-cyan-700 hover:to-cyan-800 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Adding Teacher...</span>
                </>
              ) : (
                <>
                  <FiUserPlus />
                  <span>Add Teacher</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Enhanced Help Text */}
        <div className="mt-6 p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
          <h4 className="font-semibold text-cyan-800 mb-2">
            💡 Best Practices:
          </h4>
          <ul className="text-cyan-700 text-sm space-y-1">
            <li>
              • Use institutional email addresses (@university.edu) when
              available
            </li>
            <li>• Generate strong passwords and share them securely</li>
            <li>
              • Department and subject help students find the right instructor
            </li>
            <li>
              • Teachers can update their profile and change password after
              first login
            </li>
            <li>
              • Phone numbers help with account recovery and notifications
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default AddTeacher;
