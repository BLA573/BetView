import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import AgencySidebar from "./AgencySidebar";
import AgencyTopBar from "./AgencyTopBar";

interface Props {
  children: React.ReactNode;
}

const AgencyLayout = ({ children }: Props) => {
  const { user, isAgency, agencyId, loading } = useAuth();
  const [agencyStatus, setAgencyStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!agencyId) return;
    supabase
      .from("agencies")
      .select("status")
      .eq("id", agencyId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to fetch agency status:", error.message);
          setAgencyStatus(null);
          return;
        }

        setAgencyStatus(data?.status ?? null);
      });
  }, [agencyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAgency) {
    return <Navigate to="/" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AgencySidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AgencyTopBar />
          {agencyStatus === "pending" && (
            <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              Your agency is pending approval. Some features are limited until an admin reviews your account.
            </div>
          )}
          {agencyStatus === "suspended" && (
            <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-center gap-2">
              Your agency account has been suspended. Please contact support.
            </div>
          )}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AgencyLayout;
