import React, { Suspense, lazy, useState, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ConfirmModal from "./components/ConfirmModal";
import ErrorBoundary from "./components/ErrorBoundary";
import DeveloperPanel from "./components/DeveloperPanel";

// Lazy load all page components for code-splitting
const LoginPage = lazy(() => import("./pages/LoginPage"));
const TemplateEditor = lazy(() => import("./pages/TemplateEditor"));
const IdPrint = lazy(() => import("./pages/IdPrint"));
const TemplateManagementPage = lazy(() =>
  import("./pages/TemplateManagementPage")
);
const UserManagementPage = lazy(() => import("./pages/UserManagementPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const BackupPage = lazy(() => import("./pages/BackupPage"));
const ChangePasswordPage = lazy(() => import("./pages/ChangePasswordPage"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

const App = () => {
  const [isDeveloperPanelOpen, setIsDeveloperPanelOpen] = useState(false);

  // Complex keyboard shortcut: Ctrl+Shift+Alt+D
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl+Shift+Alt+D (all modifiers must be pressed)
      // Handle both 'D' and 'd' since Shift might affect the key value
      if (e.ctrlKey && e.shiftKey && e.altKey && (e.key === 'D' || e.key === 'd' || e.code === 'KeyD')) {
        e.preventDefault();
        setIsDeveloperPanelOpen(prev => !prev);
        console.log('Developer Panel Toggled:', !isDeveloperPanelOpen);
      }
      
      // Also listen for Escape to close the panel
      if (e.key === 'Escape' && isDeveloperPanelOpen) {
        setIsDeveloperPanelOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDeveloperPanelOpen]);

  return (
    <ErrorBoundary>
      <AuthProvider>
      <HashRouter>
        <div className="h-screen flex flex-col">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/users" replace />} />
              <Route
                path="/templates"
                element={
                  <ProtectedRoute>
                    <TemplateManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/template-editor/:name"
                element={
                  <ProtectedRoute>
                    <TemplateEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/print"
                element={
                  <ProtectedRoute>
                    <IdPrint />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/backup"
                element={
                  <ProtectedRoute>
                    <BackupPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/change-password"
                element={
                  <ProtectedRoute>
                    <ChangePasswordPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>

          {/* Global Toast Notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#fff",
                color: "#363636",
                padding: "10px 14px",
                borderRadius: "6px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
                fontSize: "13px",
                maxWidth: "300px",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />

          {/* Global Confirmation Modal */}
          <ConfirmModal />

          {/* Developer Panel - Secret Panel (Ctrl+Shift+Alt+D) */}
          <DeveloperPanel 
            isOpen={isDeveloperPanelOpen} 
            onClose={() => setIsDeveloperPanelOpen(false)} 
          />
        </div>
      </HashRouter>
    </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
