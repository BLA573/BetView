import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AdminRouteGuard from "@/components/auth/AdminRouteGuard";
import AgencyRouteGuard from "@/components/auth/AgencyRouteGuard";
import AuthRequiredGuard from "@/components/auth/AuthRequiredGuard";

const Index = lazy(() => import("./pages/Index"));
const Browse = lazy(() => import("./pages/Browse"));
const Auth = lazy(() => import("./pages/Auth"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Profile = lazy(() => import("./pages/Profile"));
const Premium = lazy(() => import("./pages/Premium"));
const SavedProperties = lazy(() => import("./pages/SavedProperties"));
const PropertyAlerts = lazy(() => import("./pages/PropertyAlerts"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminListings = lazy(() => import("./pages/admin/AdminListings"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminInquiriesPage = lazy(() => import("./pages/admin/AdminInquiriesPage"));
const AdminPremium = lazy(() => import("./pages/admin/AdminPremium"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminActivityLogs = lazy(() => import("./pages/admin/AdminActivityLogs"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminAgencies = lazy(() => import("./pages/admin/AdminAgencies"));
const AgencyOverview = lazy(() => import("./pages/agency/AgencyOverview"));
const AgencyListings = lazy(() => import("./pages/agency/AgencyListings"));
const AgencyLeads = lazy(() => import("./pages/agency/AgencyLeads"));
const AgencyScanRequest = lazy(() => import("./pages/agency/AgencyScanRequest"));
const AgencyPlan = lazy(() => import("./pages/agency/AgencyPlan"));
const AgencyProfile = lazy(() => import("./pages/agency/AgencyProfile"));
const AgencyFeatured = lazy(() => import("./pages/agency/AgencyFeatured"));
const AdminFeatured = lazy(() => import("./pages/admin/AdminFeatured"));
const AdminScanRequests = lazy(() => import("./pages/admin/AdminScanRequests"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            }
          >
            <Routes>
              {/* Public */}
              <Route path="/" element={<Index />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Auth Required (any signed-in user) */}
              <Route element={<AuthRequiredGuard />}>
                <Route path="/browse" element={<Browse />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/saved" element={<SavedProperties />} />
                <Route path="/alerts" element={<PropertyAlerts />} />
              </Route>

              {/* Agency Routes */}
              <Route element={<AgencyRouteGuard />}>
                <Route path="/agency" element={<AgencyOverview />} />
                <Route path="/agency/listings" element={<AgencyListings />} />
                <Route path="/agency/leads" element={<AgencyLeads />} />
                <Route path="/agency/scan-request" element={<AgencyScanRequest />} />
                <Route path="/agency/plan" element={<AgencyPlan />} />
                <Route path="/agency/profile" element={<AgencyProfile />} />
                <Route path="/agency/featured" element={<AgencyFeatured />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<AdminRouteGuard />}>
                <Route path="/admin" element={<AdminOverview />} />
                <Route path="/admin/listings" element={<AdminListings />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/agencies" element={<AdminAgencies />} />
                <Route path="/admin/premium" element={<AdminPremium />} />
                <Route path="/admin/featured" element={<AdminFeatured />} />
                <Route path="/admin/scan-requests" element={<AdminScanRequests />} />
                <Route path="/admin/inquiries" element={<AdminInquiriesPage />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/activity" element={<AdminActivityLogs />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
