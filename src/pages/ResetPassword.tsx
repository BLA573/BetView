import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [hasSession, setHasSession] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const exchangeRecoveryCode = async () => {
            const url = new URL(window.location.href);
            const code = url.searchParams.get("code");

            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code);
                if (error) {
                    toast({ title: "Error", description: error.message, variant: "destructive" });
                    setLoading(false);
                    return;
                }
            }

            const { data } = await supabase.auth.getSession();
            setHasSession(!!data.session);
            setLoading(false);
        };

        exchangeRecoveryCode().catch((error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
            setLoading(false);
        });
    }, [toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            toast({ title: "Error", description: "Please fill in both password fields.", variant: "destructive" });
            return;
        }

        if (newPassword.length < 6) {
            toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            toast({ title: "Password updated", description: "You can now sign in with your new password." });
            navigate("/auth", { replace: true });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong.";
            toast({ title: "Error", description: message, variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center px-4">
                <p className="text-muted-foreground">Preparing reset session…</p>
            </main>
        );
    }

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
                    <h1 className="font-display font-bold text-2xl text-foreground">Reset password</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        {hasSession ? "Enter your new password below." : "Use the reset link from your email to continue."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl border border-border bg-card shadow-card">
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New password</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm new password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting || !hasSession}
                        className="w-full py-3 rounded-xl gradient-blue text-primary-foreground font-semibold shadow-blue hover:opacity-90 transition-all disabled:opacity-50"
                    >
                        {submitting ? "Updating…" : "Update password"}
                    </button>
                </form>
            </div>
        </main>
    );
};

export default ResetPassword;
