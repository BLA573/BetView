import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowLeft, LogOut } from "lucide-react";

const AgencyTopBar = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 h-14 flex items-center gap-4 px-4 bg-card border-b border-border">
      <SidebarTrigger className="text-muted-foreground" />

      <div className="flex-1" />

      <div className="flex items-center gap-2 ml-auto">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-secondary"
        >
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-semibold">
              {user?.email?.[0]?.toUpperCase() || "A"}
            </span>
          </div>
          <span className="text-sm font-medium text-foreground hidden md:block max-w-[140px] truncate">
            {user?.email}
          </span>
          <button
            onClick={signOut}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AgencyTopBar;
