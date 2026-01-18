import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Lock, Eye, EyeOff, Check, X } from "lucide-react";
import { authService } from "../services/authService";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [validations, setValidations] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    passwordsMatch: false,
  });

  // Get logged-in username from Zustand store
  const currentUsername = useAuthStore((state) => state.username);

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({ username, oldPassword, newPassword }) =>
      authService.changePassword(username, oldPassword, newPassword),
    onSuccess: () => {
      toast.success("Password changed successfully!");
      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change password");
    },
  });

  // Validate password strength
  const validatePassword = (password, confirmPassword) => {
    setValidations({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      passwordsMatch: password === confirmPassword && password.length > 0,
    });
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(newFormData);

    // Validate password when new password or confirm password changes
    if (name === "newPassword" || name === "confirmPassword") {
      validatePassword(
        name === "newPassword" ? value : newFormData.newPassword,
        name === "confirmPassword" ? value : newFormData.confirmPassword
      );
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (!formData.newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (
      !validations.minLength ||
      !validations.hasUpperCase ||
      !validations.hasLowerCase ||
      !validations.hasNumber
    ) {
      toast.error("Password does not meet requirements");
      return;
    }

    // Submit
    changePasswordMutation.mutate({
      username: currentUsername,
      oldPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Change Password
              </h1>
              <p className="text-gray-600 mt-1">Update your account password</p>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Username (Display Only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={currentUsername}
                disabled
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">You can only change your own password</p>
            </div>

            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Re-enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {formData.newPassword && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Password Requirements:
                </p>
                <div className="space-y-2">
                  <ValidationItem
                    isValid={validations.minLength}
                    text="At least 8 characters"
                  />
                  <ValidationItem
                    isValid={validations.hasUpperCase}
                    text="Contains uppercase letter (A-Z)"
                  />
                  <ValidationItem
                    isValid={validations.hasLowerCase}
                    text="Contains lowercase letter (a-z)"
                  />
                  <ValidationItem
                    isValid={validations.hasNumber}
                    text="Contains number (0-9)"
                  />
                  {formData.confirmPassword && (
                    <ValidationItem
                      isValid={validations.passwordsMatch}
                      text="Passwords match"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={
                  changePasswordMutation.isPending ||
                  !formData.currentPassword ||
                  !formData.newPassword ||
                  !formData.confirmPassword ||
                  !validations.minLength ||
                  !validations.hasUpperCase ||
                  !validations.hasLowerCase ||
                  !validations.hasNumber ||
                  !validations.passwordsMatch
                }
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {changePasswordMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Changing Password...
                  </span>
                ) : (
                  "Change Password"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setValidations({
                    minLength: false,
                    hasUpperCase: false,
                    hasLowerCase: false,
                    hasNumber: false,
                    passwordsMatch: false,
                  });
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Validation Item Component
const ValidationItem = ({ isValid, text }) => {
  return (
    <div className="flex items-center gap-2">
      {isValid ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <X className="w-4 h-4 text-gray-400" />
      )}
      <span
        className={`text-sm ${
          isValid ? "text-green-700 font-medium" : "text-gray-600"
        }`}
      >
        {text}
      </span>
    </div>
  );
};

export default ChangePasswordPage;
