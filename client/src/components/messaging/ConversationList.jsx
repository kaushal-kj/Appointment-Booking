import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "../../services/axios";
import { FaGraduationCap } from "react-icons/fa6";

import {
  FiSearch,
  FiUsers,
  FiRefreshCw,
  FiUser,
  // FiGraduationCap,
  FiBookOpen,
} from "react-icons/fi";

const ConversationList = ({ onSelect, selectedUser }) => {
  const { role } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    const endpoint = role === "student" ? "/teacher/list" : "/student/list";

    try {
      const res = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch contacts", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserIcon = (user) => {
    if (role === "student") {
      return FaGraduationCap; // Teacher icon for students
    } else {
      return FiUser; // Student icon for teachers
    }
  };

  const getUserRoleLabel = () => {
    return role === "student" ? "Teachers" : "Students";
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FiUsers className="text-cyan-600" />
            <h3 className="text-lg font-bold text-slate-800">
              {getUserRoleLabel()}
            </h3>
          </div>
          <button
            onClick={fetchUsers}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-200 group"
            title="Refresh contacts"
          >
            <FiRefreshCw className="text-slate-600 group-hover:rotate-180 transition-transform duration-300" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${getUserRoleLabel().toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUsers className="text-2xl text-slate-400" />
            </div>
            <h4 className="text-lg font-semibold text-slate-800 mb-2">
              {searchTerm
                ? "No matches found"
                : `No ${getUserRoleLabel().toLowerCase()} available`}
            </h4>
            <p className="text-slate-600 text-sm">
              {searchTerm
                ? "Try adjusting your search terms"
                : `No ${getUserRoleLabel().toLowerCase()} are currently available for messaging`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredUsers.map((user) => {
              const UserIcon = getUserIcon(user);
              const isSelected = selectedUser?._id === user._id;

              return (
                <div
                  key={user._id}
                  onClick={() => onSelect(user)}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:bg-cyan-50 relative ${
                    isSelected ? "bg-cyan-100 border-r-4 border-cyan-600" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? "bg-gradient-to-br from-cyan-500 to-cyan-600"
                          : "bg-gradient-to-br from-blue-500 to-cyan-500"
                      }`}
                    >
                      <span className="text-white font-bold text-lg">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-slate-800 truncate">
                          {user.name}
                        </h4>
                        <UserIcon
                          className={`text-sm ${
                            role === "student"
                              ? "text-cyan-600"
                              : "text-blue-600"
                          }`}
                        />
                      </div>
                      <p className="text-sm text-slate-600 truncate">
                        {user.email}
                      </p>
                      {user.subject && role === "student" && (
                        <div className="flex items-center space-x-1 mt-1">
                          <FiBookOpen className="text-xs text-green-600" />
                          <span className="text-xs text-green-600 font-medium">
                            {user.subject}
                          </span>
                        </div>
                      )}
                      {user.department && (
                        <div className="text-xs text-slate-500 mt-1">
                          {user.department}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-cyan-600 rounded-l"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-center">
          <span className="text-sm text-slate-600">
            {filteredUsers.length} {getUserRoleLabel().toLowerCase()} available
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConversationList;
