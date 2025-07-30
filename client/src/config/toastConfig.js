import { toast } from "react-toastify";

// Define your app's color themes
const themes = {
  success: {
    backgroundColor: "#10b981", // green-500
    progressBarColor: "#059669", // green-600
    textColor: "#ffffff",
    iconColor: "#dcfce7", // green-100
  },
  error: {
    backgroundColor: "#ef4444", // red-500
    progressBarColor: "#dc2626", // red-600
    textColor: "#ffffff",
    iconColor: "#fecaca", // red-100
  },
  warning: {
    backgroundColor: "#f59e0b", // amber-500
    progressBarColor: "#d97706", // amber-600
    textColor: "#ffffff",
    iconColor: "#fef3c7", // amber-100
  },
  info: {
    backgroundColor: "#3b82f6", // blue-500
    progressBarColor: "#2563eb", // blue-600
    textColor: "#ffffff",
    iconColor: "#dbeafe", // blue-100
  },
  teacher: {
    backgroundColor: "#06b6d4", // cyan-500
    progressBarColor: "#0891b2", // cyan-600
    textColor: "#ffffff",
    iconColor: "#cffafe", // cyan-100
  },
  student: {
    backgroundColor: "#8b5cf6", // violet-500
    progressBarColor: "#7c3aed", // violet-600
    textColor: "#ffffff",
    iconColor: "#e9d5ff", // violet-100
  },
  admin: {
    backgroundColor: "#f97316", // orange-500
    progressBarColor: "#ea580c", // orange-600
    textColor: "#ffffff",
    iconColor: "#fed7aa", // orange-100
  },
};

// Custom toast functions
export const showToast = {
  success: (message, options = {}) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: "toast-success",
      progressClassName: "toast-progress-success",
      ...options,
    });
  },

  error: (message, options = {}) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: "toast-error",
      progressClassName: "toast-progress-error",
      ...options,
    });
  },

  warning: (message, options = {}) => {
    toast.warning(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: "toast-warning",
      progressClassName: "toast-progress-warning",
      ...options,
    });
  },

  info: (message, options = {}) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: "toast-info",
      progressClassName: "toast-progress-info",
      ...options,
    });
  },

  teacher: (message, options = {}) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: "toast-teacher",
      progressClassName: "toast-progress-teacher",
      ...options,
    });
  },

  student: (message, options = {}) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: "toast-student",
      progressClassName: "toast-progress-student",
      ...options,
    });
  },

  admin: (message, options = {}) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: "toast-admin",
      progressClassName: "toast-progress-admin",
      ...options,
    });
  },
};

export { themes };
