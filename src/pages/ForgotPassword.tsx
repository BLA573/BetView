import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast({ title: "Error", description: "Email is required.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const redirectTo = `${window.location.origin}/reset-password`;
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
            if (error) throw error;

            toast({
                title: "Reset email sent",
                description: "Check your inbox for the password reset link.",
            });
            setEmail("");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong.";
            toast({ title: "Error", description: message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Link to="/auth" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center shadow-blue">
                            <span className="text-primary-foreground font-display font-bold text-sm">B</span>
                        </div>
                        <span className="font-display font-semibold text-xl text-foreground tracking-tight">
                            BetView <span className="text-accent font-light">ቤት View</span>
                        </span>
                    </Link>
                    <h1 className="font-display font-bold text-2xl text-foreground">Forgot password</h1>
                    <p className="text-sm text-muted-foreground mt-2">Enter your email and we’ll send a reset link.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl border border-border bg-card shadow-card">
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
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl gradient-blue text-primary-foreground font-semibold shadow-blue hover:opacity-90 transition-all disabled:opacity-50"
                    >
                        {loading ? "Sending…" : "Send reset link"}
                    </button>
                </form>
            </div>
        </main>
    );
};

export default ForgotPassword;
