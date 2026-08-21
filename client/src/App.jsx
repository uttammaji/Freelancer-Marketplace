import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { MarketplaceProvider } from './context/MarketplaceContext';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { PersonaSwitcher } from './components/common/PersonaSwitcher';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { ProjectsPage } from './pages/public/ProjectsPage';
import { ProjectDetailsPage } from './pages/public/ProjectDetailsPage';
import { FreelancersPage } from './pages/public/FreelancersPage';
import { FreelancerProfilePage } from './pages/public/FreelancerProfilePage';
import { CategoriesPage } from './pages/public/CategoriesPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Client Pages
import { ClientDashboard } from './pages/client/ClientDashboard';
import { PostProjectPage } from './pages/client/PostProjectPage';
import { MyProjectsPage } from './pages/client/MyProjectsPage';
import { ProjectProposalsPage } from './pages/client/ProjectProposalsPage';
import { ClientContractsPage } from './pages/client/ClientContractsPage';
import { ClientContractWorkspacePage } from './pages/client/ClientContractWorkspacePage';
import { ClientPaymentsPage } from './pages/client/ClientPaymentsPage';
import { ClientReviewsPage } from './pages/client/ClientReviewsPage';
import { ClientSettingsPage } from './pages/client/ClientSettingsPage';

// Freelancer Pages
import { FreelancerDashboard } from './pages/freelancer/FreelancerDashboard';
import { MyProposalsPage } from './pages/freelancer/MyProposalsPage';
import { FreelancerContractsPage } from './pages/freelancer/FreelancerContractsPage';
import { FreelancerContractWorkspacePage } from './pages/freelancer/FreelancerContractWorkspacePage';
import { FreelancerEarningsPage } from './pages/freelancer/FreelancerEarningsPage';
import { FreelancerReviewsPage } from './pages/freelancer/FreelancerReviewsPage';
import { FreelancerSettingsPage } from './pages/freelancer/FreelancerSettingsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageUsersPage } from './pages/admin/ManageUsersPage';
import { ManageProjectsPage } from './pages/admin/ManageProjectsPage';
import { ManageDisputesPage } from './pages/admin/ManageDisputesPage';
import { ManagePaymentsPage } from './pages/admin/ManagePaymentsPage';
import { ManageCategoriesPage } from './pages/admin/ManageCategoriesPage';
import { ManageReviewsPage } from './pages/admin/ManageReviewsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Shared Apps
import { MessagesPage } from './pages/messaging/MessagesPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Scroll restoration helper
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Public Layout Wrapper with Navbar, Footer & PersonaSwitcher
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
                  <Route path="/projects/:id" element={<ProjectDetailsPage />} />
                  <Route path="/freelancers" element={<FreelancersPage />} />
                  <Route path="/freelancers/:id" element={<FreelancerProfilePage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />

                  {/* Auth */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                  {/* Shared Comms */}
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* 2. Client Dashboard */}
                <Route path="/dashboard/client" element={<ClientLayoutWrapper />}>
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

                {/* 3. Freelancer Dashboard */}
                <Route path="/dashboard/freelancer" element={<FreelancerLayoutWrapper />}>
                  <Route index element={<FreelancerDashboard />} />
                  <Route path="proposals" element={<MyProposalsPage />} />
                  <Route path="contracts" element={<FreelancerContractsPage />} />
                  <Route path="contracts/:id" element={<FreelancerContractWorkspacePage />} />
                  <Route path="earnings" element={<FreelancerEarningsPage />} />
                  <Route path="reviews" element={<FreelancerReviewsPage />} />
                  <Route path="settings" element={<FreelancerSettingsPage />} />
                </Route>

                {/* 4. Admin Management Suite */}
                <Route path="/admin" element={<AdminLayoutWrapper />}>
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
