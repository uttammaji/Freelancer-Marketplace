// client/src/App.jsx
import React, { useState } from "react";
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
import { MarketplaceProvider } from "./context/MarketplaceContext";

// Layout Components
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { MobileNav } from "./components/layout/MobileNav";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { AdminLayout } from "./components/layout/AdminLayout";
import { PersonaSwitcher } from "./components/common/PersonaSwitcher";

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

// Scroll restoration helper
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// ============ ROUTE GUARDS ============

// Protected Route - Requires authentication
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Role-based route - Requires specific role
function RoleRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect to their own dashboard
    if (role === "client") return <Navigate to="/dashboard/client" replace />;
    if (role === "freelancer")
      return <Navigate to="/dashboard/freelancer" replace />;
    if (role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

// Public only route - Redirects if already logged in
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (role === "client") return <Navigate to="/dashboard/client" replace />;
    if (role === "freelancer")
      return <Navigate to="/dashboard/freelancer" replace />;
    if (role === "admin") return <Navigate to="/admin" replace />;
  }

  return children;
}

// ============ LAYOUT WRAPPERS ============

// Public Layout Wrapper
function PublicLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <PersonaSwitcher />
    </div>
  );
}

// Client Dashboard Route Wrapper
function ClientLayoutWrapper() {
  return (
    <DashboardLayout roleType="client">
      <Outlet />
      <PersonaSwitcher />
    </DashboardLayout>
  );
}

// Freelancer Dashboard Route Wrapper
function FreelancerLayoutWrapper() {
  return (
    <DashboardLayout roleType="freelancer">
      <Outlet />
      <PersonaSwitcher />
    </DashboardLayout>
  );
}

// Admin Layout Route Wrapper
function AdminLayoutWrapper() {
  return (
    <AdminLayout>
      <Outlet />
      <PersonaSwitcher />
    </AdminLayout>
  );
}

// ============ MAIN APP ============

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MarketplaceProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                {/* 1. Public & Marketing Portal */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route
                    path="/projects/:id"
                    element={<ProjectDetailsPage />}
                  />
                  <Route path="/freelancers" element={<FreelancersPage />} />
                  <Route
                    path="/freelancers/:id"
                    element={<FreelancerProfilePage />}
                  />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  {/* Google OAuth Callback - Standalone */}
                  <Route
                    path="/auth/google/callback"
                    element={<GoogleCallback />}
                  />

                  {/* Auth - Public only (redirect if logged in) */}
                  <Route
                    path="/login"
                    element={
                      <PublicOnlyRoute>
                        <LoginPage />
                      </PublicOnlyRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicOnlyRoute>
                        <RegisterPage />
                      </PublicOnlyRoute>
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={
                      <PublicOnlyRoute>
                        <ForgotPasswordPage />
                      </PublicOnlyRoute>
                    }
                  />

                  {/* Shared Comms - Protected */}
                  <Route
                    path="/messages"
                    element={
                      <ProtectedRoute>
                        <MessagesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <NotificationsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* 2. Client Dashboard - Protected + Client only */}
                <Route
                  path="/dashboard/client"
                  element={
                    <RoleRoute allowedRoles={["client"]}>
                      <ClientLayoutWrapper />
                    </RoleRoute>
                  }
                >
                  <Route index element={<ClientDashboard />} />
                  <Route path="projects" element={<MyProjectsPage />} />
                  <Route path="projects/new" element={<PostProjectPage />} />
                  <Route
                    path="projects/:id/proposals"
                    element={<ProjectProposalsPage />}
                  />
                  <Route path="contracts" element={<ClientContractsPage />} />
                  <Route
                    path="contracts/:id"
                    element={<ClientContractWorkspacePage />}
                  />
                  <Route path="payments" element={<ClientPaymentsPage />} />
                  <Route path="reviews" element={<ClientReviewsPage />} />
                  <Route path="settings" element={<ClientSettingsPage />} />
                </Route>

                {/* 3. Freelancer Dashboard - Protected + Freelancer only */}
                <Route
                  path="/dashboard/freelancer"
                  element={
                    <RoleRoute allowedRoles={["freelancer"]}>
                      <FreelancerLayoutWrapper />
                    </RoleRoute>
                  }
                >
                  <Route index element={<FreelancerDashboard />} />
                  <Route path="proposals" element={<MyProposalsPage />} />
                  <Route
                    path="contracts"
                    element={<FreelancerContractsPage />}
                  />
                  <Route
                    path="contracts/:id"
                    element={<FreelancerContractWorkspacePage />}
                  />
                  <Route path="earnings" element={<FreelancerEarningsPage />} />
                  <Route path="reviews" element={<FreelancerReviewsPage />} />
                  <Route path="settings" element={<FreelancerSettingsPage />} />
                </Route>

                {/* 4. Admin Management Suite - Protected + Admin only */}
                <Route
                  path="/admin"
                  element={
                    <RoleRoute allowedRoles={["admin"]}>
                      <AdminLayoutWrapper />
                    </RoleRoute>
                  }
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
          </MarketplaceProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
