// client/src/App.jsx
import React, { useState, lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layout Components
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { MobileNav } from "./components/layout/MobileNav";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { AdminLayout } from "./components/layout/AdminLayout";

// Public Pages
import { LandingPage } from "./pages/public/LandingPage";
import { ProjectsPage } from "./pages/public/ProjectsPage";
import { ProjectDetailsPage } from "./pages/public/ProjectDetailsPage";
import { FreelancersPage } from "./pages/public/FreelancersPage";
import { FreelancerProfilePage } from "./pages/public/FreelancerProfilePage";
import { CategoriesPage } from "./pages/public/CategoriesPage";
import { HowItWorksPage } from "./pages/public/HowItWorksPage";
import { GoogleCallback } from "./pages/auth/GoogleCallback";

// Auth Pages
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";

// Client Pages
import { ClientDashboard } from "./pages/client/ClientDashboard";
import { PostProjectPage } from "./pages/client/PostProjectPage";
import { MyProjectsPage } from "./pages/client/MyProjectsPage";
import { ProjectProposalsPage } from "./pages/client/ProjectProposalsPage";
import { ClientContractsPage } from "./pages/client/ClientContractsPage";
import { ClientContractWorkspacePage } from "./pages/client/ClientContractWorkspacePage";
import { ClientPaymentsPage } from "./pages/client/ClientPaymentsPage";
import { ClientReviewsPage } from "./pages/client/ClientReviewsPage";
import { ClientSettingsPage } from "./pages/client/ClientSettingsPage";

// Freelancer Pages
import { FreelancerDashboard } from "./pages/freelancer/FreelancerDashboard";
import { MyProposalsPage } from "./pages/freelancer/MyProposalsPage";
import { FreelancerContractsPage } from "./pages/freelancer/FreelancerContractsPage";
import { FreelancerContractWorkspacePage } from "./pages/freelancer/FreelancerContractWorkspacePage";
import { FreelancerEarningsPage } from "./pages/freelancer/FreelancerEarningsPage";
import { FreelancerReviewsPage } from "./pages/freelancer/FreelancerReviewsPage";
import { FreelancerSettingsPage } from "./pages/freelancer/FreelancerSettingsPage";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ManageUsersPage } from "./pages/admin/ManageUsersPage";
import { ManageProjectsPage } from "./pages/admin/ManageProjectsPage";
import { ManageDisputesPage } from "./pages/admin/ManageDisputesPage";
import { ManagePaymentsPage } from "./pages/admin/ManagePaymentsPage";
import { ManageCategoriesPage } from "./pages/admin/ManageCategoriesPage";
import { ManageReviewsPage } from "./pages/admin/ManageReviewsPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";

// Shared Apps
import { MessagesPage } from "./pages/messaging/MessagesPage";
import { NotificationsPage } from "./pages/notifications/NotificationsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

/**
 * Scroll to top on route change
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * Loading screen component
 */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Protected Route - Requires authentication
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

/**
 * Role-based Route - Requires specific role
 */
function RoleRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(role)) {
    if (role === "client") return <Navigate to="/dashboard/client" replace />;
    if (role === "freelancer") return <Navigate to="/dashboard/freelancer" replace />;
    if (role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * Public Only Route - Redirects if already logged in
 */
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  if (isLoading) return <LoadingScreen />;

  if (isAuthenticated) {
    if (role === "client") return <Navigate to="/dashboard/client" replace />;
    if (role === "freelancer") return <Navigate to="/dashboard/freelancer" replace />;
    if (role === "admin") return <Navigate to="/admin" replace />;
  }

  return children;
}

/**
 * Public Layout
 */
function PublicLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
      <MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/**
 * Client Dashboard Layout
 */
function ClientLayoutWrapper() {
  return (
    <DashboardLayout roleType="client">
      <Outlet />
    </DashboardLayout>
  );
}

/**
 * Freelancer Dashboard Layout
 */
function FreelancerLayoutWrapper() {
  return (
    <DashboardLayout roleType="freelancer">
      <Outlet />
    </DashboardLayout>
  );
}

/**
 * Admin Layout
 */
function AdminLayoutWrapper() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

/**
 * Main App Component
 */
export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectDetailsPage />} />
                <Route path="/freelancers" element={<FreelancersPage />} />
                <Route path="/freelancers/:id" element={<FreelancerProfilePage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />

                {/* Auth Routes */}
                <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
                <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
                <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />

                {/* Shared Routes */}
                <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Client Dashboard Routes */}
              <Route
                path="/dashboard/client"
                element={<RoleRoute allowedRoles={["client"]}><ClientLayoutWrapper /></RoleRoute>}
              >
                <Route index element={<ClientDashboard />} />
                <Route path="projects" element={<MyProjectsPage />} />
                <Route path="projects/new" element={<PostProjectPage />} />
                <Route path="projects/:id/proposals" element={<ProjectProposalsPage />} />
                <Route path="contracts" element={<ClientContractsPage />} />
                <Route path="contracts/:id" element={<ClientContractWorkspacePage />} />
                <Route path="payments" element={<ClientPaymentsPage />} />
                <Route path="reviews" element={<ClientReviewsPage />} />
                <Route path="settings" element={<ClientSettingsPage />} />
              </Route>

              {/* Freelancer Dashboard Routes */}
              <Route
                path="/dashboard/freelancer"
                element={<RoleRoute allowedRoles={["freelancer"]}><FreelancerLayoutWrapper /></RoleRoute>}
              >
                <Route index element={<FreelancerDashboard />} />
                <Route path="proposals" element={<MyProposalsPage />} />
                <Route path="contracts" element={<FreelancerContractsPage />} />
                <Route path="contracts/:id" element={<FreelancerContractWorkspacePage />} />
                <Route path="earnings" element={<FreelancerEarningsPage />} />
                <Route path="reviews" element={<FreelancerReviewsPage />} />
                <Route path="settings" element={<FreelancerSettingsPage />} />
              </Route>

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={<RoleRoute allowedRoles={["admin"]}><AdminLayoutWrapper /></RoleRoute>}
              >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<ManageUsersPage />} />
                <Route path="projects" element={<ManageProjectsPage />} />
                <Route path="disputes" element={<ManageDisputesPage />} />
                <Route path="payments" element={<ManagePaymentsPage />} />
                <Route path="categories" element={<ManageCategoriesPage />} />
                <Route path="reviews" element={<ManageReviewsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;