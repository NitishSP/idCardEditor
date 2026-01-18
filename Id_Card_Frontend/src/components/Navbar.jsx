import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CreditCard,
  Edit,
  FolderOpen,
  Users,
  LogOut,
  Settings,
  UserCircle,
  Key,
  FileText,
  ChevronDown,
  Shield,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useAuthStore } from "../store";
import toast from "react-hot-toast";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const username = useAuthStore((state) => state.username);
  const isRootUser = useAuthStore((state) => state.isRootUser());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
    setShowProfileMenu(false);
  };

  const handleChangePassword = () => {
    setShowProfileMenu(false);
    navigate("/change-password");
  };

  const handleSettings = () => {
    setShowProfileMenu(false);
    navigate("/settings");
  };

  const handleLogs = () => {
    setShowProfileMenu(false);
    // TODO: Navigate to logs page
    toast.info("Logs feature coming soon");
  };

  const handleBackup = () => {
    setShowProfileMenu(false);
    navigate("/backup");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  const isAdmin = true;
  // const isAdmin = user?.role === "admin";

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🪪 ID Card System
            </h1>
            {username && (
              <div className="ml-4 flex items-center gap-2">
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {username}
                </span>
                {isRootUser && (
                  <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                    <Shield size={12} />
                    ROOT
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/users"
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                isActive("/users")
                  ? "bg-cyan-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Users size={18} />
              Users
            </Link>

            <Link
              to="/print"
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                isActive("/print")
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <CreditCard size={18} />
              Print IDs
            </Link>

            <Link
              to="/templates"
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                isActive("/templates")
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FolderOpen size={18} />
              Templates
            </Link>

            <Link
              to="/template-editor/new"
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                isActive("/template-editor")
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Edit size={18} />
              Editor
            </Link>

            <Link
              to="/settings"
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                isActive("/settings")
                  ? "bg-orange-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Settings size={18} />
              Settings
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md"
              >
                <UserCircle size={18} />
                Profile
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.username}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role || "User"}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={handleChangePassword}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                  >
                    <Key size={16} />
                    Change Password
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        onClick={handleBackup}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                      >
                        <Shield size={16} />
                        Backup & Restore
                      </button>
                      <button
                        onClick={handleLogs}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                      >
                        <FileText size={16} />
                        Logs
                      </button>
                    </>
                  )}

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
