import { useState, useEffect } from 'react';
import { X, Database, Trash2, RefreshCw, Download, AlertTriangle, Lock, CheckCircle, Users, Plus, Trash } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * ConfirmationModal - Custom confirmation modal for dangerous operations
 */
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (inputValue === confirmText) {
      onConfirm();
      setInputValue('');
    } else {
      toast.error(`Please type "${confirmText}" to confirm`);
    }
  };

  const handleCancel = () => {
    setInputValue('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-gray-800 text-white rounded-lg shadow-2xl w-full max-w-md border-2 border-red-600">
        <div className="bg-red-600 px-6 py-4 flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-yellow-300" />
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-gray-300 whitespace-pre-line">{message}</p>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Type <span className="font-bold text-red-400">{confirmText}</span> to confirm:
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleConfirm()}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 text-white"
              placeholder={confirmText}
              autoFocus
              disabled={isLoading}
            />
          </div>
          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || inputValue !== confirmText}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * DeveloperPanel - Secure developer-only panel for root operations
 * Access: Ctrl+Shift+Alt+D + Password
 * Features: Database backup, clean DB, reinitialize with defaults
 */
const DeveloperPanel = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dbPath, setDbPath] = useState('');
  const [dbSize, setDbSize] = useState('');
  const [operations, setOperations] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null });
  const [activeTab, setActiveTab] = useState('operations'); // 'operations' | 'credentials'
  
  // Credential Management State
  const [credentials, setCredentials] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showAddCredential, setShowAddCredential] = useState(false);

  // Get database info on mount
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadDatabaseInfo();
      loadCredentials();
    }
  }, [isOpen, isAuthenticated]);

  const loadDatabaseInfo = async () => {
    try {
      const info = await window.electron.getDatabaseInfo();
      if (info.success) {
        setDbPath(info.path);
        setDbSize(info.size);
      }
    } catch (error) {
      console.error('Failed to load database info:', error);
    }
  };

  const loadCredentials = async () => {
    try {
      const result = await window.electron.developerGetAllCredentials();
      if (result.success) {
        setCredentials(result.data);
      }
    } catch (error) {
      console.error('Failed to load credentials:', error);
    }
  };

  const handleAuthenticate = () => {
    const correctPassword = import.meta.env.VITE_DEVELOPER_PASSWORD;
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      toast.success('Developer access granted');
      addOperation('Authentication successful', 'success');
    } else {
      toast.error('Invalid developer password');
      setPassword('');
      addOperation('Authentication failed', 'error');
    }
  };

  const addOperation = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setOperations(prev => [...prev, { message, type, timestamp }]);
  };

  const handleBackupDatabase = async () => {
    if (!confirm('Create a full database backup?')) return;
    
    setIsLoading(true);
    addOperation('Starting database backup...', 'info');
    
    try {
      const result = await window.electron.developerBackupDB();
      if (result.success) {
        toast.success('Database backup created successfully');
        addOperation(`Backup created: ${result.filename}`, 'success');
        await loadDatabaseInfo();
      } else {
        toast.error(result.error || 'Backup failed');
        addOperation(`Backup failed: ${result.error}`, 'error');
      }
    } catch (error) {
      toast.error('Backup operation failed');
      addOperation(`Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanDatabase = async () => {
    setConfirmModal({ 
      isOpen: true, 
      type: 'clean',
      title: '⚠️ DANGER: Delete All Data',
      message: 'This will DELETE ALL data from the database!\n\nAll users, templates, fields, and authentication data will be permanently removed.',
      confirmText: 'DELETE ALL DATA'
    });
  };

  const executeCleanDatabase = async () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
    setIsLoading(true);
    addOperation('Starting database clean (DELETE ALL DATA)...', 'warning');
    
    try {
      const result = await window.electron.developerCleanDB();
      if (result.success) {
        toast.success('Database cleaned successfully');
        addOperation('All data deleted successfully', 'success');
        await loadDatabaseInfo();
      } else {
        toast.error(result.error || 'Clean failed');
        addOperation(`Clean failed: ${result.error}`, 'error');
      }
    } catch (error) {
      toast.error('Clean operation failed');
      addOperation(`Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReinitializeDatabase = async () => {
    setConfirmModal({ 
      isOpen: true, 
      type: 'reinit',
      title: '⚠️ Reset Database',
      message: 'This will RESET the database to default state!\n\nAll existing data will be lost and replaced with default users and fields.',
      confirmText: 'REINIT'
    });
  };

  const executeReinitializeDatabase = async () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
    setIsLoading(true);
    addOperation('Reinitializing database with defaults...', 'info');
    
    try {
      const result = await window.electron.developerReinitDB();
      if (result.success) {
        toast.success('Database reinitialized with default data');
        addOperation('Database reset to defaults successfully', 'success');
        await loadDatabaseInfo();
      } else {
        toast.error(result.error || 'Reinitialization failed');
        addOperation(`Reinitialization failed: ${result.error}`, 'error');
      }
    } catch (error) {
      toast.error('Reinitialization operation failed');
      addOperation(`Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportLogs = async () => {
    setIsLoading(true);
    addOperation('Exporting application logs...', 'info');
    
    try {
      const result = await window.electron.developerExportLogs();
      if (result.success) {
        toast.success('Logs exported successfully');
        addOperation(`Logs exported to: ${result.path}`, 'success');
      } else {
        toast.error(result.error || 'Export failed');
        addOperation(`Export failed: ${result.error}`, 'error');
      }
    } catch (error) {
      toast.error('Export operation failed');
      addOperation(`Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCredential = async () => {
    if (!newUsername || !newPassword) {
      toast.error('Username and password are required');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    addOperation(`Creating credential for: ${newUsername}`, 'info');

    try {
      const result = await window.electron.developerCreateCredential(newUsername, newPassword);
      if (result.success) {
        toast.success('Credential created successfully');
        addOperation(`Credential created: ${newUsername}`, 'success');
        setNewUsername('');
        setNewPassword('');
        setShowAddCredential(false);
        await loadCredentials();
      } else {
        toast.error(result.error || 'Failed to create credential');
        addOperation(`Create failed: ${result.error}`, 'error');
      }
    } catch (error) {
      toast.error('Create operation failed');
      addOperation(`Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCredential = async (id, username) => {
    if (!confirm(`Delete credential for "${username}"?`)) return;

    setIsLoading(true);
    addOperation(`Deleting credential: ${username}`, 'warning');

    try {
      const result = await window.electron.developerDeleteCredential(id);
      if (result.success) {
        toast.success('Credential deleted successfully');
        addOperation(`Credential deleted: ${username}`, 'success');
        await loadCredentials();
      } else {
        toast.error(result.error || 'Failed to delete credential');
        addOperation(`Delete failed: ${result.error}`, 'error');
      }
    } catch (error) {
      toast.error('Delete operation failed');
      addOperation(`Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsAuthenticated(false);
    setPassword('');
    setOperations([]);
    setConfirmModal({ isOpen: false, type: null });
    setActiveTab('operations');
    setShowAddCredential(false);
    setNewUsername('');
    setNewPassword('');
    onClose();
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === 'clean') {
      executeCleanDatabase();
    } else if (confirmModal.type === 'reinit') {
      executeReinitializeDatabase();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isLoading={isLoading}
      />

      {/* Main Developer Panel */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 text-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border-2 border-red-600">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-300 animate-pulse" />
            <h2 className="text-xl font-bold">Developer Panel</h2>
            <span className="px-2 py-1 bg-red-900 text-xs rounded">ROOT ACCESS</span>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-red-700 p-2 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Authentication */}
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <Lock className="w-16 h-16 text-red-500" />
              <h3 className="text-2xl font-bold">Authentication Required</h3>
              <p className="text-gray-400 text-center max-w-md">
                This panel contains dangerous root-level operations. Enter the developer password to continue.
              </p>
              <div className="flex items-center space-x-3 w-full max-w-md">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAuthenticate()}
                  placeholder="Enter developer password"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500"
                  autoFocus
                />
                <button
                  onClick={handleAuthenticate}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                >
                  Authenticate
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Database Info */}
              <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-blue-400" />
                  Database Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Path:</span>
                    <span className="font-mono text-xs">{dbPath || 'Loading...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Size:</span>
                    <span className="font-mono">{dbSize || 'Loading...'}</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-2 mb-6 border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('operations')}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === 'operations'
                      ? 'text-red-400 border-b-2 border-red-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  DB Operations
                </button>
                <button
                  onClick={() => setActiveTab('credentials')}
                  className={`px-4 py-2 font-medium transition-colors flex items-center ${
                    activeTab === 'credentials'
                      ? 'text-red-400 border-b-2 border-red-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Credentials ({credentials.length})
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'operations' ? (
                <>
                  {/* Operations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Backup */}
                <button
                  onClick={handleBackupDatabase}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed p-6 rounded-lg transition-colors text-left group"
                >
                  <Download className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-lg mb-2">Backup Database</h4>
                  <p className="text-sm text-gray-300">Create a full backup of the current database</p>
                </button>

                {/* Clean DB */}
                <button
                  onClick={handleCleanDatabase}
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed p-6 rounded-lg transition-colors text-left group"
                >
                  <Trash2 className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-lg mb-2">Clean Database</h4>
                  <p className="text-sm text-gray-300">Delete all data from the database</p>
                </button>

                {/* Reinitialize */}
                <button
                  onClick={handleReinitializeDatabase}
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed p-6 rounded-lg transition-colors text-left group"
                >
                  <RefreshCw className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-lg mb-2">Reinitialize DB</h4>
                  <p className="text-sm text-gray-300">Reset database to default state with seed data</p>
                </button>

                {/* Export Logs */}
                <button
                  onClick={handleExportLogs}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed p-6 rounded-lg transition-colors text-left group"
                >
                  <CheckCircle className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-lg mb-2">Export Logs</h4>
                  <p className="text-sm text-gray-300">Export application logs for debugging</p>
                </button>
              </div>

              {/* Operation Log */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-bold mb-3">Operation Log</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {operations.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No operations yet</p>
                  ) : (
                    operations.map((op, index) => (
                      <div
                        key={index}
                        className={`text-sm p-2 rounded ${
                          op.type === 'success'
                            ? 'bg-green-900/30 text-green-300'
                            : op.type === 'error'
                            ? 'bg-red-900/30 text-red-300'
                            : op.type === 'warning'
                            ? 'bg-orange-900/30 text-orange-300'
                            : 'bg-blue-900/30 text-blue-300'
                        }`}
                      >
                        <span className="font-mono text-xs text-gray-400">[{op.timestamp}]</span>{' '}
                        {op.message}
                      </div>
                    ))
                  )}
                </div>
              </div>
                </>
              ) : (
                <>
                  {/* Credentials Management */}
                  <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold flex items-center">
                        <Users className="w-5 h-5 mr-2 text-green-400" />
                        User Credentials
                      </h3>
                      <button
                        onClick={() => setShowAddCredential(!showAddCredential)}
                        disabled={isLoading}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add User</span>
                      </button>
                    </div>

                    {/* Add Credential Form */}
                    {showAddCredential && (
                      <div className="bg-gray-900 p-4 rounded-lg mb-4 border border-gray-700">
                        <h4 className="font-bold mb-3">Create New Credential</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Username</label>
                            <input
                              type="text"
                              value={newUsername}
                              onChange={(e) => setNewUsername(e.target.value)}
                              placeholder="Enter username"
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500"
                              disabled={isLoading}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">Password</label>
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter password (min 6 characters)"
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500"
                              disabled={isLoading}
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleAddCredential}
                              disabled={isLoading}
                              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg transition-colors"
                            >
                              {isLoading ? 'Creating...' : 'Create'}
                            </button>
                            <button
                              onClick={() => {
                                setShowAddCredential(false);
                                setNewUsername('');
                                setNewPassword('');
                              }}
                              disabled={isLoading}
                              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Credentials List */}
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {credentials.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-8">No credentials found</p>
                      ) : (
                        credentials.map((cred) => (
                          <div
                            key={cred.id}
                            className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                          >
                            <div>
                              <p className="font-medium text-white">{cred.username}</p>
                              <p className="text-xs text-gray-400">
                                Created: {new Date(cred.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteCredential(cred.id, cred.username)}
                              disabled={isLoading}
                              className="p-2 text-red-400 hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                              title="Delete credential"
                            >
                              <Trash className="w-5 h-5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Warning */}
              <div className="mt-6 bg-red-900/20 border border-red-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-200">
                    <p className="font-bold mb-1">⚠️ Production Environment Warning</p>
                    <p className="text-xs text-red-300">
                      These operations can permanently modify or delete data. Always create a backup before performing destructive operations. This panel should only be used by authorized developers.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default DeveloperPanel;
