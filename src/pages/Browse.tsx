import BrowseSection from "@/components/landing/BrowseSection";
import FooterSection from "@/components/landing/FooterSection";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Browse = () => {
  return (
    <main className="min-h-screen bg-background">
      {/* Top Bar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 bg-card/80 backdrop-blur-lg border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center shadow-blue">
            <span className="text-primary-foreground font-display font-bold text-sm">B</span>
          </div>
          <span className="font-display font-semibold text-xl text-foreground tracking-tight">
            BetView <span className="text-accent font-light">ቤት View</span>
          </span>
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </nav>

      <BrowseSection />
      <FooterSection />
    </main>
  );
};

export default Browse;
