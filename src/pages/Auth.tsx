import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, User } from "lucide-react";

type AccountType = "buyer" | "agency";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("buyer");
  const [agencyName, setAgencyName] = useState("");
  const [agencyPhone, setAgencyPhone] = useState("");
  const [agencyLicense, setAgencyLicense] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [agencySyncing, setAgencySyncing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAdmin, isAgency, loading, refreshRoles } = useAuth();

  useEffect(() => {
    if (!user || loading) return;
    if (isAdmin) navigate("/admin", { replace: true });
    else if (isAgency) navigate("/agency", { replace: true });
    else navigate("/browse", { replace: true });
  }, [user, isAdmin, isAgency, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back!" });
        // Redirect is handled by useEffect above when auth state updates
      } else {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
              account_type: accountType,
              agency_name: accountType === "agency" ? agencyName : null,
              agency_phone: accountType === "agency" ? agencyPhone : null,
              agency_license: accountType === "agency" ? agencyLicense : null,
            },
          },
        });
        if (signUpError) throw signUpError;

        if (!signUpData.user) {
          throw new Error("Signup did not return a user.");
        }

        if (!signUpData.session) {
          toast({
            title: "Account created",
            description: "Check your inbox and confirm your email to finish setup.",
          });
          setIsLogin(true);
          return;
        }

        if (accountType === "agency") {
          await createAgencyProfile(
            {
            name: agencyName,
            phone: agencyPhone,
            license_number: agencyLicense,
            },
            email.trim(),
          );
        }

        toast({ title: "Account created!" });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const createAgencyProfile = useCallback(async (
    agencyData: { name: string; phone: string; license_number: string },
    contactEmail?: string,
  ) => {
    const cleanAgencyData = {
      name: agencyData.name.trim(),
      phone: agencyData.phone.trim(),
      license_number: agencyData.license_number.trim(),
    };

    if (!cleanAgencyData.name || !cleanAgencyData.phone) {
      throw new Error("Agency name and phone are required.");
    }

    const { data, error } = await supabase.rpc("register_agency_account", {
      _name: cleanAgencyData.name,
      _phone: cleanAgencyData.phone,
      _license_number: cleanAgencyData.license_number || null,
      _email: contactEmail?.trim() || email.trim() || null,
    });

    if (error) {
      throw error;
    }

    await refreshRoles();
    return data;
  }, [email, refreshRoles]);

  useEffect(() => {
    if (!user || loading || isAgency || agencySyncing) return;

    const metadata = (user.user_metadata || {}) as {
      account_type?: string;
      agency_name?: string | null;
      agency_phone?: string | null;
      agency_license?: string | null;
    };

    if (metadata.account_type !== "agency") return;
    if (!metadata.agency_name || !metadata.agency_phone) return;

    setAgencySyncing(true);
    void createAgencyProfile(
      {
        name: metadata.agency_name,
        phone: metadata.agency_phone,
        license_number: metadata.agency_license || "",
      },
      user.email || undefined,
    )
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Failed to finish agency setup.";
        toast({ title: "Agency setup pending", description: message, variant: "destructive" });
      })
      .finally(() => setAgencySyncing(false));
  }, [user, loading, isAgency, agencySyncing, createAgencyProfile, toast]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center shadow-blue">
              <span className="text-primary-foreground font-display font-bold text-sm">B</span>
            </div>
            <span className="font-display font-semibold text-xl text-foreground tracking-tight">
              BetView <span className="text-accent font-light">ቤት View</span>
            </span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-foreground">
            {isLogin ? "Sign in to your account" : "Create an account"}
          </h1>
          {!isLogin && (
            <p className="text-sm text-muted-foreground mt-1">
              Choose how you want to use BetView
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl border border-border bg-card shadow-card">
          {/* Role Selector (sign-up only) */}
          {!isLogin && (
            <div className="space-y-3">
              <Label>I am a…</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType("buyer")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    accountType === "buyer"
                      ? "border-primary bg-primary/5 shadow-blue"
                      : "border-border bg-secondary/30 hover:border-primary/40"
                  }`}
                >
                  <User className={`w-6 h-6 ${accountType === "buyer" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-semibold ${accountType === "buyer" ? "text-primary" : "text-foreground"}`}>
                    Property Seeker
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    Browse listings & VR tours
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("agency")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    accountType === "agency"
                      ? "border-primary bg-primary/5 shadow-blue"
                      : "border-border bg-secondary/30 hover:border-primary/40"
                  }`}
                >
                  <Building2 className={`w-6 h-6 ${accountType === "agency" ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-semibold ${accountType === "agency" ? "text-primary" : "text-foreground"}`}>
                    Real Estate Agency
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    List properties & manage leads
                  </span>
                </button>
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                required={!isLogin}
              />
            </div>
          )}

          {/* Agency-specific fields */}
          {!isLogin && accountType === "agency" && (
            <div className="space-y-3 p-4 rounded-lg bg-secondary/50 border border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Agency Details</p>
              <div className="space-y-2">
                <Label htmlFor="agencyName">Agency Name *</Label>
                <Input
                  id="agencyName"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="e.g. Addis Homes Agency"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agencyPhone">Agency Phone *</Label>
                <Input
                  id="agencyPhone"
                  value={agencyPhone}
                  onChange={(e) => setAgencyPhone(e.target.value)}
                  placeholder="+251 9xx xxx xxxx"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agencyLicense">License Number</Label>
                <Input
                  id="agencyLicense"
                  value={agencyLicense}
                  onChange={(e) => setAgencyLicense(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl gradient-blue text-primary-foreground font-semibold shadow-blue hover:opacity-90 transition-all disabled:opacity-50"
          >
            {submitting
              ? "Please wait…"
              : isLogin
                ? "Sign In"
                : accountType === "agency"
                  ? "Register Agency"
                  : "Sign Up"
            }
          </button>
          {isLogin && (
            <div className="text-right -mt-2">
              <Link to="/forgot-password" className="text-xs text-primary font-medium hover:underline">
                Forgot password?
              </Link>
            </div>
          )}
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </form>

        {!isLogin && accountType === "agency" && (
          <p className="text-center text-xs text-muted-foreground">
            Agency accounts require approval. You'll get access to your dashboard immediately with limited features until approved.
          </p>
        )}
      </div>
    </main>
  );
};

export default Auth;
