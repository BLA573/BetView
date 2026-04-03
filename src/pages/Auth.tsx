import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const sendSignupConfirmationEmail = async (payload: {
  email: string;
  displayName: string;
}) => {
  const serviceId = import.meta.env.VITE_EMAILJS_SIGNUP_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_SIGNUP_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_SIGNUP_PUBLIC_KEY;
  const recipientEmail = (payload.email || "").trim();

  if (!serviceId || !templateId || !publicKey) {
    throw new Error("Signup email service is not configured.");
  }

  if (!recipientEmail) {
    throw new Error("Signup recipient email is empty.");
  }

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: recipientEmail,
        to: recipientEmail,
        recipient_email: recipientEmail,
        user_email: payload.email,
        reply_to: payload.email,
        user_name: payload.displayName || payload.email,
        app_name: "BetView",
        login_url: `${window.location.origin}/auth`,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to send signup confirmation email.");
  }
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const hasAdminRole = async (userId: string) => {
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (error) throw error;
    return !!data;
  };

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const admin = await hasAdminRole(user.id);
        navigate(admin ? "/admin" : "/", { replace: true });
      } catch {
        navigate("/", { replace: true });
      }
    })();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const userId = data.user?.id;
        if (userId) {
          const admin = await hasAdminRole(userId);
          navigate(admin ? "/admin" : "/", { replace: true });
        } else {
          navigate("/", { replace: true });
        }

        toast({ title: "Welcome back!" });
      } else {
        await sendSignupConfirmationEmail({
          email,
          displayName,
        });

        toast({
          title: "Signup request sent",
          description: "Your request was sent via EmailJS.",
        });

        navigate("/auth", { replace: true });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

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
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl border border-border bg-card shadow-card">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                required={!isLogin}
              />
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
            {submitting ? "Please wait…" : isLogin ? "Sign In" : "Sign Up"}
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
      </div>
    </main>
  );
};

export default Auth;
