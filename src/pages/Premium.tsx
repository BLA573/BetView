import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Crown, Check, ShieldCheck, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const features = [
  "Early access to new listings (24 hours before free users)",
  "Priority inquiry routing to agencies",
  "Unlimited Saved Properties",
  "Price change & status alerts",
  "Advanced Search Filters (Verified only, etc.)",
  "Direct Booking for VR Consultations",
];

const Premium = () => {
  const { user, isPremium, isAdmin, isAgency } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);

  const handleUpgradeRequest = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setLoading(true);
    
    // Check if a request already exists
    const { data: existing } = await supabase
      .from("premium_requests")
      .select("id, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'pending') {
        toast({ title: "Request already pending", description: "Our team is reviewing your upgrade request." });
        setRequested(true);
      } else if (existing.status === 'approved') {
        toast({ title: "You are already premium!" });
      }
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("premium_requests").insert({
      user_id: user.id,
      status: "pending",
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Request Submitted", description: "We will contact you shortly to activate your premium plan." });
      setRequested(true);
    }
    setLoading(false);
  };

  if (isPremium) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mb-6 border-4 border-yellow-500/30">
          <Crown className="w-10 h-10 text-yellow-600" />
        </div>
        <h1 className="font-display font-bold text-3xl text-foreground mb-4">You're a Premium Member!</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Enjoy unlimited access to saved properties, alerts, and priority communication with agencies.
        </p>
        <Link to="/browse" className="px-6 py-3 rounded-xl gradient-blue text-white shadow-blue font-semibold">
          Browse Properties
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center shadow-blue">
            <span className="text-primary-foreground font-display font-bold text-sm">B</span>
          </div>
          <span className="font-display font-semibold text-xl text-foreground tracking-tight">
            BetView <span className="text-accent font-light">ቤት View</span>
          </span>
        </Link>
        <Link to="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left: Info */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-xs font-bold uppercase tracking-wider mb-6 border border-yellow-500/20">
              <Star className="w-3.5 h-3.5" /> BetView Premium
            </div>
            <h1 className="font-display font-bold text-4xl text-foreground leading-tight mb-4">
              Find your next home <span className="text-transparent bg-clip-text gradient-blue">faster</span>.
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Upgrade to Premium for early access to the best properties, advanced tracking, and priority agent responses.
            </p>
            
            <ul className="space-y-4 mb-8">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-foreground">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Card */}
          <div className="p-8 rounded-2xl bg-card border border-border shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] relative">
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg rotate-12">
              <Crown className="w-6 h-6 text-white" />
            </div>
            
            <h3 className="font-display font-bold text-2xl text-foreground mb-2">Premium Access</h3>
            <p className="text-sm text-muted-foreground mb-6">Billed monthly. Cancel anytime.</p>
            
            <div className="flex items-baseline gap-1 mb-8">
              <span className="font-display font-bold text-5xl text-foreground">300</span>
              <span className="text-muted-foreground font-medium">ETB / month</span>
            </div>

            <div className="space-y-4">
              {isAdmin || isAgency ? (
                <div className="p-4 bg-muted rounded-xl text-center text-sm text-muted-foreground border">
                  As an {isAdmin ? "Admin" : "Agency"}, you already have full platform access. This pass is meant for regular buyers.
                </div>
              ) : requested ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">Your request is currently under review by our agents.</p>
                </div>
              ) : (
                <>
                  <Button 
                    onClick={handleUpgradeRequest} 
                    disabled={loading} 
                    className="w-full text-base py-6 rounded-xl gradient-blue shadow-blue"
                  >
                    {loading ? "Processing..." : "Request Premium Upgrade"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Our team will contact you to set up your subscription via Telebirr or CBE Birr.
                  </p>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default Premium;
