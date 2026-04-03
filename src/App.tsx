import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AdminRouteGuard from "@/components/auth/AdminRouteGuard";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminListings from "./pages/admin/AdminListings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminInquiriesPage from "./pages/admin/AdminInquiriesPage";
import AdminReports from "./pages/admin/AdminReports";
import AdminActivityLogs from "./pages/admin/AdminActivityLogs";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<AdminRouteGuard />}>
              <Route path="/admin" element={<AdminOverview />} />
              <Route path="/admin/listings" element={<AdminListings />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/inquiries" element={<AdminInquiriesPage />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/activity" element={<AdminActivityLogs />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
