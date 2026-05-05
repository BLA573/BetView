import { useState } from "react";
import BrowseSection from "@/components/landing/BrowseSection";
import FooterSection from "@/components/landing/FooterSection";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SignOutConfirmDialog from "@/components/shared/SignOutConfirmDialog";
import ThemeToggle from "@/components/shared/ThemeToggle";


const Browse = () => {
  const { user, isAdmin, isAgency } = useAuth();
  const [signOutOpen, setSignOutOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background page-transition">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 bg-card/80 backdrop-blur-lg border-b border-border">
        <Link to="../property/PropertyDetail" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center shadow-blue">
            <span className="text-primary-foreground font-display font-bold text-sm">B</span>
          </div>
          <span className="font-display font-semibold text-xl text-foreground tracking-tight">
            BetView <span className="text-accent font-light">ቤት View</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user && !isAgency && !isAdmin && (
            <Link to="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Profile</Link>
          )}
          {user && (
            <button onClick={() => setSignOutOpen(true)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign Out
            </button>
          )}
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <BrowseSection />
      <FooterSection />
      <SignOutConfirmDialog open={signOutOpen} onClose={() => setSignOutOpen(false)} />
    </main>
  );
};

export default Browse;
