import React, { useState, useEffect } from "react";
import {
  Shield,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  FolderOpen,
  Lock,
  Unlock,
  Database,
  AlertCircle,
  CheckCircle,
  Clock,
  HardDrive,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import useAuthStore from "../store/useAuthStore";
import {
  useBackups,
  useCreateBackup,
  useRestoreBackup,
  useVerifyBackup,
  useCleanupBackups,
  useExportBackup,
} from "../hooks/useBackup";
import { backupService } from "../services/backupService";

const BackupPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [restorePassword, setRestorePassword] = useState("");
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [backupDirectory, setBackupDirectory] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showVerifyResult, setShowVerifyResult] = useState(null);

  const { data: backups, isLoading, refetch } = useBackups();

  // Check if logged-in user is a root user using Zustand
  const isRootUser = useAuthStore((state) => state.isRootUser());
  const createBackupMutation = useCreateBackup({
    onSuccess: (data) => {
      toast.success(`Backup created successfully!\n${data.filename}`);
      setPassword("");
      setConfirmPassword("");
      setShowCreateModal(false);
    },
    onError: (error) => {
      toast.error(`Failed to create backup: ${error.message}`);
    },
  });

  const restoreBackupMutation = useRestoreBackup({
    onSuccess: (data) => {
      toast.success(
        `Backup restored successfully!\nUsers: ${data.restored.users}, Templates: ${data.restored.templates}, Credentials: ${data.restored.credentials}, Fields: ${data.restored.fields}`
      );
      setRestorePassword("");
      setSelectedBackup(null);
      setShowRestoreModal(false);
    },
    onError: (error) => {
      toast.error(`Failed to restore backup: ${error.message}`);
    },
  });

  const verifyBackupMutation = useVerifyBackup({
    onSuccess: (data) => {
      setShowVerifyResult(data);
      if (data.valid) {
        toast.success("Backup file is valid!");
      } else {
        toast.error("Invalid backup file or incorrect password");
      }
    },
    onError: (error) => {
      toast.error(`Verification failed: ${error.message}`);
    },
  });

  const cleanupBackupsMutation = useCleanupBackups({
    onSuccess: (data) => {
      toast.success(`Cleaned up ${data.deleted} old backup(s)`);
    },
    onError: (error) => {
      toast.error(`Cleanup failed: ${error.message}`);
    },
  });

  const exportBackupMutation = useExportBackup({
    onSuccess: (path) => {
      if (path) {
        toast.success(`Backup exported to: ${path}`);
      }
    },
    onError: (error) => {
      toast.error(`Export failed: ${error.message}`);
    },
  });

  useEffect(() => {
    const loadBackupDirectory = async () => {
      try {
        const data = await backupService.getBackupDirectory();
        setBackupDirectory(data.directory);
      } catch {
        // Silently fail - backup directory will show as unknown
      }
    };
    loadBackupDirectory();
  }, []);

  const handleCreateBackup = () => {
    if (!password) {
      toast.error("Please enter a password");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    createBackupMutation.mutate(password);
  };

  const handleRestoreBackup = () => {
    if (!selectedBackup) {
      toast.error("Please select a backup file");
      return;
    }
    if (!restorePassword) {
      toast.error("Please enter the backup password");
      return;
    }
    restoreBackupMutation.mutate({
      filepath: selectedBackup.filepath,
      password: restorePassword,
    });
  };

  const handleVerifyBackup = (backup) => {
    if (!restorePassword) {
      toast.error("Please enter the password to verify");
      return;
    }
    verifyBackupMutation.mutate({
      filepath: backup.filepath,
      password: restorePassword,
    });
  };

  const handleSelectBackupFile = async () => {
    try {
      const filepath = await backupService.selectBackupFile();
      if (filepath) {
        setSelectedBackup({
          filepath,
          filename: filepath.split(/[\\/]/).pop(),
        });
        setShowRestoreModal(true);
      }
      // If filepath is null/undefined, user canceled - no error needed
    } catch (error) {
      toast.error("Failed to select backup file: " + error.message);
    }
  };

  const handleExportBackup = (backup) => {
    exportBackupMutation.mutate(backup.filepath);
  };

  const handleCleanupOld = () => {
    if (
      window.confirm("Keep only the last 10 backups and delete older ones?")
    ) {
      cleanupBackupsMutation.mutate(10);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Shield size={24} className="text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Backup & Restore
                  </h1>
                  <p className="text-sm text-gray-600">
                    Secure encrypted backups of your data
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => refetch()}
                  disabled={!isRootUser}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    isRootUser
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
                <button
                  onClick={handleCleanupOld}
                  disabled={!isRootUser}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    isRootUser
                      ? "bg-orange-100 hover:bg-orange-200 text-orange-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Trash2 size={16} />
                  Cleanup Old
                </button>
              </div>
            </div>

            {/* Access Restriction Warning */}
            {!isRootUser && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle size={20} className="text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">
                    Access Restricted
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Only root users (admin, pixelVedaAdmin, pixelVedaTesting,
                    pixelVedaLogin) can perform backup and restore operations.
                  </p>
                </div>
              </div>
            )}

            {/* Backup Directory Info */}
            {backupDirectory && isRootUser && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <HardDrive size={16} className="text-blue-600" />
                <span className="text-sm text-blue-800">
                  <strong>Backup Location:</strong> {backupDirectory}
                </span>
              </div>
            )}
          </div>

          {/* Show content only for root users */}
          {!isRootUser ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Lock size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Backup Access Restricted
              </h3>
              <p className="text-gray-500">
                Only root users can access backup and restore features.
              </p>
            </div>
          ) : (
            <>
              {/* Action Cards */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Create Backup Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Database size={32} className="text-green-600" />
                    <div>
                      <h2 className="text-xl font-bold text-green-800">
                        Create Backup
                      </h2>
                      <p className="text-sm text-green-700">
                        Export all your data securely
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-all shadow-md"
                  >
                    <Download size={20} />
                    Create New Backup
                  </button>
                </div>

                {/* Restore Backup Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Upload size={32} className="text-blue-600" />
                    <div>
                      <h2 className="text-xl font-bold text-blue-800">
                        Restore Backup
                      </h2>
                      <p className="text-sm text-blue-700">
                        Import data from backup file
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSelectBackupFile}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 font-medium transition-all shadow-md"
                  >
                    <FolderOpen size={20} />
                    Select Backup File
                  </button>
                </div>
              </div>

              {/* Backups List */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Available Backups
                </h2>

                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading backups...</p>
                  </div>
                ) : backups && backups.length > 0 ? (
                  <div className="space-y-3">
                    {backups.map((backup, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Lock size={16} className="text-gray-600" />
                              <h3 className="font-semibold text-gray-800">
                                {backup.filename}
                              </h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Clock size={14} />
                                <span>{formatDate(backup.modified)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <HardDrive size={14} />
                                <span>{formatFileSize(backup.size)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => {
                                setSelectedBackup(backup);
                                setShowRestoreModal(true);
                              }}
                              className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg flex items-center gap-2 text-sm transition-all"
                              title="Restore"
                            >
                              <Upload size={16} />
                              Restore
                            </button>
                            <button
                              onClick={() => handleExportBackup(backup)}
                              className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg flex items-center gap-2 text-sm transition-all"
                              title="Export"
                            >
                              <Download size={16} />
                              Export
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield size={48} className="text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No backups found</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Create your first backup to get started
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Lock size={24} className="text-green-600" />
                Create Encrypted Backup
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Enter a strong password to encrypt your backup
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Encryption Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter strong password (min 8 characters)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <AlertCircle size={14} className="inline mr-1" />
                  <strong>Important:</strong> Remember this password! It cannot
                  be recovered if lost.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBackup}
                disabled={createBackupMutation.isPending}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {createBackupMutation.isPending
                  ? "Creating..."
                  : "Create Backup"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Backup Modal */}
      {showRestoreModal && selectedBackup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Unlock size={24} className="text-blue-600" />
                Restore Backup
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedBackup.filename}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Password
                </label>
                <input
                  type="password"
                  value={restorePassword}
                  onChange={(e) => setRestorePassword(e.target.value)}
                  placeholder="Enter backup password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {showVerifyResult && (
                <div
                  className={`p-3 rounded-lg ${
                    showVerifyResult.valid
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  {showVerifyResult.valid ? (
                    <div>
                      <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                        <CheckCircle size={16} />
                        Valid Backup File
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Users: {showVerifyResult.dataCount.users} | Templates:{" "}
                        {showVerifyResult.dataCount.templates} | Credentials:{" "}
                        {showVerifyResult.dataCount.credentials} | Fields:{" "}
                        {showVerifyResult.dataCount.fields}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-red-800 flex items-center gap-2">
                      <AlertCircle size={16} />
                      {showVerifyResult.error}
                    </p>
                  )}
                </div>
              )}

              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-800">
                  <AlertCircle size={14} className="inline mr-1" />
                  <strong>Warning:</strong> Restoring will add data to your
                  current database. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowRestoreModal(false);
                  setRestorePassword("");
                  setSelectedBackup(null);
                  setShowVerifyResult(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifyBackup(selectedBackup)}
                disabled={verifyBackupMutation.isPending}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
              >
                {verifyBackupMutation.isPending ? "Verifying..." : "Verify"}
              </button>
              <button
                onClick={handleRestoreBackup}
                disabled={restoreBackupMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {restoreBackupMutation.isPending ? "Restoring..." : "Restore"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupPage;
