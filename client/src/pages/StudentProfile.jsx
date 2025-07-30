import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { showToast } from "../config/toastConfig";
import axios from "../services/axios";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiBook,
  FiCalendar,
  FiEdit3,
  FiSave,
  FiX,
  FiCamera,
  FiAward,
  FiBookOpen,
  FiExternalLink,
  FiClock,
  FiUsers,
  FiStar,
  FiTrendingUp,
  // FiGraduationCap
} from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa6";

const StudentProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Fetch student profile
  const fetchProfile = async () => {
    try {
      setIsLoading(true);

      const response = await axios.get("/student/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.data.success) {
        setProfile(response.data.data);
        setEditForm(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      showToast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle form input changes
  const handleInputChange = (path, value) => {
    setEditForm((prev) => {
      const newForm = { ...prev };
      const keys = path.split(".");
      let current = newForm;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newForm;
    });
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const response = await axios.put("/student/profile", editForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.data.success) {
        setProfile(response.data.data);
        setIsEditing(false);
        showToast.student("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      showToast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  // Handle profile picture upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      showToast.error("Please select an image smaller than 2MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast.error("Please select an image file");
      return;
    }

    try {
      setIsUploadingImage(true);

      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await axios.post("/student/profile/picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        setProfile((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            profilePicture: response.data.data.profilePicture,
          },
        }));
        showToast.student("Profile picture updated successfully!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-16 sm:pt-20 px-3 sm:px-4 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-300 rounded-full"></div>
                <div className="space-y-4 text-center sm:text-left">
                  <div className="h-6 sm:h-8 bg-gray-300 rounded w-48 sm:w-64"></div>
                  <div className="h-3 sm:h-4 bg-gray-300 rounded w-32 sm:w-48"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 mt-2 sm:pt-20 px-3 sm:px-4 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header - Mobile Responsive */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              {/* Profile Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                {/* Profile Picture with Simple Edit Button */}
                <div className="relative flex-shrink-0">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="profile-picture-input"
                  />

                  <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg relative">
                    {profile?.profile?.profilePicture ? (
                      <img
                        src={profile.profile.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                        {profile?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase() || "S"}
                      </span>
                    )}

                    {/* Loading Overlay */}
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {/* Simple Pencil Edit Button */}
                  <button
                    onClick={() =>
                      document.getElementById("profile-picture-input").click()
                    }
                    disabled={isUploadingImage}
                    className="absolute -bottom-2 -right-2 bg-white text-green-600 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                    title="Change profile picture"
                  >
                    <FiCamera className="text-sm" />
                  </button>
                </div>

                {/* Basic Info */}
                <div className="text-white text-center sm:text-left flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-3">
                    <span>{profile?.name}</span>
                    <div className="flex items-center space-x-1 bg-white/20 px-2 sm:px-3 py-1 rounded-full">
                      <FaGraduationCap className="text-white text-xs sm:text-sm" />
                      <span className="text-xs sm:text-sm font-medium">
                        Student
                      </span>
                    </div>
                  </h1>

                  {/* Contact Info - Stack on mobile */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-green-100 mb-2 space-y-1 sm:space-y-0">
                    <div className="flex items-center justify-center sm:justify-start space-x-1">
                      <FiMail className="text-xs sm:text-sm" />
                      <span className="text-xs sm:text-sm break-all">
                        {profile?.email}
                      </span>
                    </div>
                    {profile?.profile?.studentId && (
                      <div className="flex items-center justify-center sm:justify-start space-x-1">
                        <FiUsers className="text-xs sm:text-sm" />
                        <span className="text-xs sm:text-sm">
                          ID: {profile.profile.studentId}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Academic Info - Stack on mobile */}
                  <div className="text-green-100 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center text-sm sm:text-base">
                      {profile?.profile?.course && (
                        <span className="font-medium">
                          {profile.profile.course}
                        </span>
                      )}
                      {profile?.profile?.year && (
                        <span className="sm:ml-2">
                          {profile?.profile?.course ? "• " : ""}Year{" "}
                          {profile.profile.year}
                        </span>
                      )}
                      {profile?.profile?.section && (
                        <span className="sm:ml-2">
                          • Section {profile.profile.section}
                        </span>
                      )}
                    </div>
                    {profile?.profile?.cgpa && (
                      <div className="mt-1 sm:mt-2 text-xs sm:text-sm">
                        <span>CGPA: {profile.profile.cgpa}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Button - Full width on mobile */}
              <div className="w-full lg:w-auto">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full lg:w-auto bg-white/20 hover:bg-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl flex items-center justify-center space-x-2 transition-all duration-200"
                  >
                    <FiEdit3 className="text-sm sm:text-base" />
                    <span className="text-sm sm:text-base">Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50"
                    >
                      <FiSave className="text-sm sm:text-base" />
                      <span className="text-sm sm:text-base">
                        {isSaving ? "Saving..." : "Save"}
                      </span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl flex items-center justify-center space-x-2 transition-all duration-200"
                    >
                      <FiX className="text-sm sm:text-base" />
                      <span className="text-sm sm:text-base">Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4 flex items-center space-x-2">
                <FiUser className="text-green-600" />
                <span>Personal Information</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm?.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                  ) : (
                    <p className="text-slate-600 py-2 sm:py-3 text-sm sm:text-base">
                      {profile?.name || "Not specified"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <p className="text-slate-600 py-2 sm:py-3 text-sm sm:text-base break-all">
                    {profile?.email}
                  </p>
                  <p className="text-xs text-slate-400">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm?.profile?.phone || ""}
                      onChange={(e) =>
                        handleInputChange("profile.phone", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                  ) : (
                    <p className="text-slate-600 py-2 sm:py-3 text-sm sm:text-base">
                      {profile?.profile?.phone || "Not specified"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Student ID
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm?.profile?.studentId || ""}
                      onChange={(e) =>
                        handleInputChange("profile.studentId", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                  ) : (
                    <p className="text-slate-600 py-2 sm:py-3 text-sm sm:text-base">
                      {profile?.profile?.studentId || "Not specified"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date of Birth
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={
                        editForm?.profile?.dateOfBirth?.split("T")[0] || ""
                      }
                      onChange={(e) =>
                        handleInputChange("profile.dateOfBirth", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                  ) : (
                    <p className="text-slate-600 py-2 sm:py-3 text-sm sm:text-base">
                      {profile?.profile?.dateOfBirth
                        ? new Date(
                            profile.profile.dateOfBirth
                          ).toLocaleDateString()
                        : "Not specified"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm?.profile?.address || ""}
                      onChange={(e) =>
                        handleInputChange("profile.address", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                  ) : (
                    <p className="text-slate-600 py-2 sm:py-3 text-sm sm:text-base">
                      {profile?.profile?.address || "Not specified"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4 flex items-center space-x-2">
                <FiBookOpen className="text-green-600" />
                <span>Academic Information</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Course
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm?.profile?.course || ""}
                      onChange={(e) =>
                        handleInputChange("profile.course", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                  ) : (
                    <p className="text-slate-600 py-2 sm:py-3 text-sm sm:text-base">
                      {profile?.profile?.course || "Not specified"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Year
                  </label>
                  {isEditing ? (
                    <select
                      value={editForm?.profile?.year || ""}
                      onChange={(e) =>
                        handleInputChange("profile.year", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  ) : (
                    <p className="text-slate-600 py-2 sm:py-3 text-sm sm:text-base">
                      {profile?.profile?.year
                        ? `${profile.profile.year} Year`
                        : "Not specified"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Section
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm?.profile?.section || ""}
                      onChange={(e) =>
                        handleInputChange("profile.section", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                  ) : (
                    <p className="text-slate-600 py-2 sm:py-3 text-sm sm:text-base">
                      {profile?.profile?.section || "Not specified"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    CGPA
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={editForm?.profile?.cgpa || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "profile.cgpa",
                          parseFloat(e.target.value) || ""
                        )
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                  ) : (
                    <p className="text-slate-600 py-2 sm:py-3 text-sm sm:text-base">
                      {profile?.profile?.cgpa || "Not specified"}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subjects of Interest
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={
                        editForm?.profile?.subjectsOfInterest?.join(", ") || ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "profile.subjectsOfInterest",
                          e.target.value.split(", ").filter(Boolean)
                        )
                      }
                      placeholder="Enter subjects separated by commas"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2 py-2">
                      {profile?.profile?.subjectsOfInterest?.map(
                        (subject, index) => (
                          <span
                            key={index}
                            className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                          >
                            {subject}
                          </span>
                        )
                      ) || (
                        <p className="text-slate-500 text-sm">
                          No subjects specified
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4">
                About Me
              </h3>
              {isEditing ? (
                <textarea
                  value={editForm?.profile?.bio || ""}
                  onChange={(e) =>
                    handleInputChange("profile.bio", e.target.value)
                  }
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Tell us about yourself, your goals, and interests..."
                />
              ) : (
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  {profile?.profile?.bio || "No bio available"}
                </p>
              )}
            </div>
          </div>

          {/* Sidebar - Mobile Stack Below */}
          <div className="space-y-4 sm:space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4 flex items-center space-x-2">
                <FiTrendingUp className="text-green-600" />
                <span>Academic Info</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-sm sm:text-base">
                    CGPA
                  </span>
                  <span className="text-slate-800 font-medium text-sm sm:text-base">
                    {profile?.profile?.cgpa || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-sm sm:text-base">
                    Year
                  </span>
                  <span className="text-slate-800 font-medium text-sm sm:text-base">
                    {profile?.profile?.year
                      ? `${profile.profile.year} Year`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 text-sm sm:text-base">
                    Joined
                  </span>
                  <span className="text-slate-800 font-medium text-sm sm:text-base">
                    {new Date(profile?.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Career Goals */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4">
                Career Goals
              </h3>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm?.profile?.careerGoals?.join(", ") || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "profile.careerGoals",
                      e.target.value.split(", ").filter(Boolean)
                    )
                  }
                  placeholder="Enter career goals separated by commas"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile?.profile?.careerGoals?.map((goal, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                    >
                      {goal}
                    </span>
                  )) || (
                    <p className="text-slate-500 text-sm">
                      No career goals specified
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-3 sm:mb-4">
                Social Links
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    LinkedIn
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editForm?.profile?.socialLinks?.linkedin || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "profile.socialLinks.linkedin",
                          e.target.value
                        )
                      }
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-slate-200 rounded-md sm:rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="text-slate-700 text-xs sm:text-sm">
                      {profile?.profile?.socialLinks?.linkedin ? (
                        <a
                          href={profile.profile.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 break-all"
                        >
                          <span>LinkedIn Profile</span>
                          <FiExternalLink className="text-xs flex-shrink-0" />
                        </a>
                      ) : (
                        "Not specified"
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    GitHub
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editForm?.profile?.socialLinks?.github || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "profile.socialLinks.github",
                          e.target.value
                        )
                      }
                      placeholder="https://github.com/yourusername"
                      className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-slate-200 rounded-md sm:rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="text-slate-700 text-xs sm:text-sm">
                      {profile?.profile?.socialLinks?.github ? (
                        <a
                          href={profile.profile.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 break-all"
                        >
                          <span>GitHub Profile</span>
                          <FiExternalLink className="text-xs flex-shrink-0" />
                        </a>
                      ) : (
                        "Not specified"
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
