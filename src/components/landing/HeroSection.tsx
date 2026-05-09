import heroVr from "@/assets/hero-vr.jpg";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import SignOutConfirmDialog from "@/components/shared/SignOutConfirmDialog";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { Menu, X, LayoutDashboard, Shield, User, LogOut, LogIn } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isAgency } = useAuth();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToForm = () => {
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToDemo = () => {
    document.getElementById("vr-demo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroVr}
          alt="BetView VR real estate platform"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy" style={{ background: 'linear-gradient(to bottom, transparent 60%, hsl(215,66%,10%) 100%)' }} />
      </div>

      {/* ── NAVBAR (original desktop layout, hamburger added for mobile) ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-16 py-6">
        {/* Logo — always visible */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center shadow-blue">
            <span className="text-primary-foreground font-display font-bold text-sm">B</span>
          </div>
          <span className="font-display font-semibold text-xl text-white tracking-tight">
            BetView <span className="text-blue-glow font-light">ቤት View</span>
          </span>
        </div>

        {/* Desktop nav — UNCHANGED from original */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#vr-demo" className="text-sm text-white/70 hover:text-white transition-colors">VR Demo</a>
          <Link to="/browse" className="text-sm text-white/70 hover:text-white transition-colors">Browse</Link>
          <Link to="/pricing" className="text-sm text-white/70 hover:text-white transition-colors">Pricing</Link>
          <a href="#solution" className="text-sm text-white/70 hover:text-white transition-colors">How It Works</a>
          <a href="#agencies" className="text-sm text-white/70 hover:text-white transition-colors">For Agencies</a>
          {isAdmin && (
            <Link to="/admin" className="text-sm text-white/70 hover:text-white transition-colors">Admin</Link>
          )}
          {isAgency && (
            <Link to="/agency" className="text-sm text-white/70 hover:text-white transition-colors">Dashboard</Link>
          )}
          {user && !isAgency && !isAdmin && (
            <Link to="/profile" className="text-sm text-white/70 hover:text-white transition-colors">Profile</Link>
          )}
          {user ? (
            <button onClick={() => setSignOutOpen(true)} className="px-5 py-2 rounded-lg gradient-blue text-sm font-medium text-white shadow-blue hover:opacity-90 transition-opacity">
              Sign Out
            </button>
          ) : (
            <Link to="/auth" className="px-5 py-2 rounded-lg gradient-blue text-sm font-medium text-white shadow-blue hover:opacity-90 transition-opacity">
              Sign In
            </Link>
          )}
          <ThemeToggle compact />
        </div>

        {/* Mobile-only: theme toggle + hamburger button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle compact />
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* ── MOBILE MENU OVERLAY (only renders on mobile) ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Dim backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Slide-in panel from right */}
          <div
            className="absolute right-0 top-0 bottom-0 w-72 flex flex-col"
            style={{ background: 'hsl(215,66%,8%)', borderLeft: '1px solid hsl(215,40%,18%)' }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'hsl(215,40%,18%)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg gradient-blue flex items-center justify-center shadow-blue">
                  <span className="text-white font-bold text-xs">B</span>
                </div>
                <span className="font-display font-semibold text-white">BetView</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              <a href="#vr-demo" onClick={() => setMobileMenuOpen(false)} className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all min-h-[48px]">VR Demo</a>
              <Link to="/browse" onClick={() => setMobileMenuOpen(false)} className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all min-h-[48px]">Browse Properties</Link>
              <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all min-h-[48px]">Pricing</Link>
              <a href="#solution" onClick={() => setMobileMenuOpen(false)} className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all min-h-[48px]">How It Works</a>
              <a href="#agencies" onClick={() => setMobileMenuOpen(false)} className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all min-h-[48px]">For Agencies</a>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all min-h-[48px]">
                  <Shield className="w-4 h-4 opacity-50" /> Admin Dashboard
                </Link>
              )}
              {isAgency && (
                <Link to="/agency" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all min-h-[48px]">
                  <LayoutDashboard className="w-4 h-4 opacity-50" /> Agency Dashboard
                </Link>
              )}
              {user && !isAgency && !isAdmin && (
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all min-h-[48px]">
                  <User className="w-4 h-4 opacity-50" /> My Profile
                </Link>
              )}
            </div>

            {/* Panel footer CTA */}
            <div className="p-4 border-t" style={{ borderColor: 'hsl(215,40%,18%)' }}>
              {user ? (
                <button
                  onClick={() => { setMobileMenuOpen(false); setSignOutOpen(true); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/20 text-white/80 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-blue text-white shadow-blue hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <SignOutConfirmDialog open={signOutOpen} onClose={() => setSignOutOpen(false)} />

      {/* ── HERO CONTENT (original, untouched) ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 animate-fade-up">
          <div className="w-2 h-2 rounded-full bg-blue-glow animate-pulse" />
          <span className="text-xs text-white/80 font-medium tracking-wide">Ethiopia's trusted property platform..</span>
        </div>

        <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl text-white max-w-4xl leading-tight animate-fade-up animation-delay-200">
          See Your Next Home{" "}
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'var(--gradient-blue)' }}>
            Before You Step Inside.
          </span>
        </h1>

        <p className="mt-6 text-base md:text-xl text-white/65 max-w-2xl leading-relaxed animate-fade-up animation-delay-400">
          Ethiopia's first virtual reality real estate platform. Explore properties in immersive 3D before visiting in person.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-up animation-delay-600">
          <button
            onClick={() => navigate('/browse')}
            className="px-8 py-4 rounded-xl gradient-blue text-white font-semibold shadow-blue pulse-blue hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Explore Properties
          </button>
          <button
            onClick={scrollToDemo}
            className="px-8 py-4 rounded-xl glass text-white font-medium hover:bg-white/10 transition-all flex items-center gap-2 justify-center"
          >
            <span className="w-5 h-5 rounded-full border border-white/50 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 ml-0.5" fill="currentColor" viewBox="0 0 8 10">
                <path d="M0 0l8 5-8 5V0z" />
              </svg>
            </span>
            View VR Demo
          </button>
        </div>

        {/* Stats */}
        <div className="mt-20 flex flex-col sm:flex-row gap-8 animate-fade-up animation-delay-800">
          {[
            { value: "360°", label: "Immersive Tours" },
            { value: "3D", label: "Property Scans" },
            { value: "24/7", label: "Remote Access" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="font-display font-bold text-3xl text-white">{stat.value}</span>
              <span className="text-sm text-white/50 mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="relative z-10 flex justify-center pb-8 animate-bounce">
        <div className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2.5 rounded-full bg-white/40" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
