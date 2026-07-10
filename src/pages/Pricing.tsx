import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Building2, Crown, Rocket, Star, ArrowLeft, Smartphone, CreditCard } from "lucide-react";
import FooterSection from "@/components/landing/FooterSection";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/shared/ThemeToggle";


const agencyTiers = [
  {
    name: "Basic",
    price: "3,000",
    yearly: "30,600",
    icon: Building2,
    listings: "5",
    popular: false,
    features: ["Up to 5 active listings", "Lead notifications", "Agency public profile", "Request property scans", "Basic support"],
  },
  {
    name: "Pro",
    price: "7,000",
    yearly: "71,400",
    icon: Star,
    listings: "15",
    popular: true,
    features: ["Up to 15 active listings", "Lead notifications + priority routing", "Agency public profile with badge", "Request property scans", "Featured listing discounts", "Priority support"],
  },
  {
    name: "Enterprise",
    price: "15,000",
    yearly: "153,000",
    icon: Rocket,
    listings: "Unlimited",
    popular: false,
    features: ["Unlimited active listings", "Priority lead routing", "Premium agency profile", "Dedicated account manager", "Bulk scan pricing", "Custom analytics dashboard", "24/7 priority support"],
  },
];

const featuredPlans = [
  { duration: "7 days", price: "1,000", label: "Starter Boost" },
  { duration: "14 days", price: "1,800", label: "Most Popular", popular: true },
  { duration: "30 days", price: "3,000", label: "Maximum Exposure" },
];

const PaymentBadges = () => (
  <div className="flex items-center gap-3 mt-4 flex-wrap">
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-foreground">
      <CreditCard className="w-3.5 h-3.5 text-primary" /> CBE Transfer
    </div>
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-foreground">
      <Smartphone className="w-3.5 h-3.5 text-primary" /> Telebirr
    </div>
  </div>
);

const Pricing = () => {
  const { user, isAgency } = useAuth();
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  const handleSelectPlan = (tier: typeof agencyTiers[0]) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!isAgency) {
      navigate("/auth");
      return;
    }
    navigate("/checkout", {
      state: {
        plan: {
          name: tier.name,
          price: isYearly ? tier.yearly : tier.price,
          period: isYearly ? "per year" : "per month",
        },
      },
    });
  };

  const handleSelectPremium = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    navigate("/checkout", {
      state: { plan: { name: "Premium Buyer", price: "150", period: "per month" } },
    });
  };

  return (
    <main className="min-h-screen bg-background page-transition">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/betview_logo_primary.png"
            alt="BetView Logo"
            className="h-8 w-auto object-contain"
          />
          <span className="font-display font-semibold text-xl text-foreground tracking-tight">
            BetView <span className="text-accent font-light">ቤት View</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          {!user && (
            <Link to="/auth" className="px-5 py-2 rounded-lg gradient-blue text-sm font-medium text-white shadow-blue hover:opacity-90 transition-opacity">
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 md:py-24 text-center px-6">
        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-4 bg-primary/10 text-primary">
          Simple Pricing
        </span>
        <h1 className="font-display font-bold text-3xl md:text-5xl text-foreground max-w-3xl mx-auto leading-tight">
          Plans Built for{" "}
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: "var(--gradient-blue)" }}>
            Every Stage of Growth
          </span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          Whether you're starting out or scaling up — BetView has a plan that fits your agency.
        </p>
      </section>

      {/* Agency Tiers */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display font-bold text-2xl text-foreground text-center mb-3">For Real Estate Agencies</h2>
          <p className="text-muted-foreground text-center mb-6">All plans include VR listing support and lead management</p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <span className={`text-sm font-medium transition-colors ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
            <button
              onClick={() => setIsYearly((v) => !v)}
              aria-pressed={isYearly}
              aria-label="Toggle billing period"
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isYearly ? "bg-primary" : "bg-secondary border border-border"
                }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-300 ${isYearly ? "translate-x-7" : "translate-x-0"
                  }`}
              />
            </button>
            <span className={`flex items-center gap-2 text-sm font-medium transition-colors ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
              Yearly
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold gradient-blue text-white shadow-blue">
                Save 15%
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {agencyTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-8 border transition-all hover:-translate-y-1 duration-300 ${tier.popular
                    ? "border-primary bg-primary/[0.03] shadow-blue"
                    : "border-border bg-card shadow-card hover:shadow-blue"
                  }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-blue text-xs font-semibold text-white shadow-blue">
                    Most Popular
                  </span>
                )}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tier.popular ? "gradient-blue shadow-blue" : "bg-secondary"}`}>
                    <tier.icon className={`w-5 h-5 ${tier.popular ? "text-white" : "text-primary"}`} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground">{tier.name}</h3>
                    <p className="text-xs text-muted-foreground">Up to {tier.listings} listings</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display font-bold text-3xl text-foreground transition-all">
                      {isYearly ? tier.yearly : tier.price}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {isYearly ? "ETB/yr" : "ETB/mo"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isYearly
                      ? `≈ ${Math.round(Number(tier.yearly.replace(/,/g, "")) / 12).toLocaleString()} ETB/mo`
                      : `or ${tier.yearly} ETB/year `}
                    {!isYearly && <span className="text-primary font-medium">(save 15%)</span>}
                  </p>
                </div>

                {/* Payment methods */}
                <PaymentBadges />

                <ul className="space-y-3 my-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(tier)}
                  className={`block w-full py-3 rounded-xl text-center font-semibold text-sm transition-all ${tier.popular
                      ? "gradient-blue text-white shadow-blue hover:opacity-90"
                      : "border border-border text-foreground hover:bg-secondary"
                    }`}
                >
                  {isAgency ? `Subscribe — ${tier.name}` : `Get ${tier.name} Plan`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scanning Pricing */}
      <section className="py-20 px-6" style={{ background: "hsl(215,66%,10%)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-4"
            style={{ background: "hsl(214,80%,40%,0.15)", color: "hsl(var(--blue-glow))" }}>
            360° Scanning Service
          </span>
          <h2 className="font-display font-bold text-3xl text-white mb-4">Professional Property Scanning</h2>
          <p className="text-lg mb-10" style={{ color: "hsl(215,30%,65%)" }}>
            Our team visits your property and creates a photorealistic 360° virtual tour using professional equipment.
          </p>
          <div className="rounded-2xl p-8 md:p-10 text-center" style={{ background: "hsl(215,55%,14%)", border: "1px solid hsl(215,40%,22%)" }}>
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="font-display font-bold text-4xl text-white">10,000 – 25,000</span>
              <span style={{ color: "hsl(215,30%,65%)" }}>ETB</span>
            </div>
            <p style={{ color: "hsl(215,30%,55%)" }} className="mb-6">per property scan (price varies by property size and location)</p>
            <div className="flex flex-wrap justify-center gap-3">
              {["HD 360° Capture", "Room-by-Room Navigation", "Verified Badge Eligible", "Hosted on BetView", "Complete in 3–5 Days"].map((f) => (
                <span key={f} className="px-4 py-1.5 rounded-full text-sm font-medium"
                  style={{ borderColor: "hsl(214,80%,40%,0.3)", border: "1px solid", color: "hsl(var(--blue-glow))", background: "hsl(214,80%,40%,0.08)" }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-2xl text-foreground mb-3">Featured Listing Placement</h2>
          <p className="text-muted-foreground mb-10">Boost your property to the top of search results with a gold badge</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPlans.map((plan) => (
              <div key={plan.duration} className={`rounded-2xl p-6 border transition-all hover:-translate-y-1 duration-300 ${plan.popular ? "border-primary bg-primary/[0.03] shadow-blue" : "border-border bg-card shadow-card"}`}>
                {plan.popular && (
                  <span className="inline-block px-3 py-0.5 rounded-full gradient-blue text-xs font-semibold text-white mb-3 shadow-blue">Recommended</span>
                )}
                <p className="text-sm text-muted-foreground mb-1">{plan.label}</p>
                <p className="font-display font-bold text-2xl text-foreground mb-1">{plan.price} ETB</p>
                <p className="text-sm text-muted-foreground">{plan.duration}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Buyer */}
      <section className="py-20 px-6 bg-secondary/50">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl p-8 md:p-10 border border-border bg-card shadow-card text-center">
            <div className="w-14 h-14 rounded-xl gradient-blue flex items-center justify-center mx-auto mb-6 shadow-blue">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-display font-bold text-2xl text-foreground mb-3">Premium Buyer Access</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get early access to new listings, advanced filters, price alerts, and priority support from agents.
            </p>
            <div className="flex items-baseline justify-center gap-1 mb-6">
              <span className="font-display font-bold text-3xl text-foreground">150 – 300</span>
              <span className="text-muted-foreground">ETB/month</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {["Early Access Listings", "Advanced Filters", "Save & Track Properties", "Price Change Alerts", "Priority Inquiries", "Verified Listings Filter", "Remote Consultation"].map((f) => (
                <span key={f} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-sm text-foreground">
                  <Check className="w-3.5 h-3.5 text-primary" />{f}
                </span>
              ))}
            </div>
            <button
              onClick={handleSelectPremium}
              className="inline-block px-8 py-3 rounded-xl gradient-blue text-white font-semibold shadow-blue hover:opacity-90 transition-all"
            >
              {user ? "Upgrade to Premium" : "Sign Up to Get Started"}
            </button>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact-pricing" className="py-20 px-6" style={{ background: "hsl(215,66%,10%)" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl text-white mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8" style={{ color: "hsl(215,30%,65%)" }}>
            Contact us to set up your agency account or discuss a custom plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:info@betview.et" className="px-8 py-4 rounded-xl gradient-blue text-white font-semibold shadow-blue hover:opacity-90 transition-all">
              Contact Us — info@betview.et
            </a>
            <a href="tel:+251931503581" className="px-8 py-4 rounded-xl glass text-white font-medium hover:bg-white/10 transition-all" style={{ border: "1px solid hsl(215,40%,22%)" }}>
              Call Us
            </a>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
};

export default Pricing;
