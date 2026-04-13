import { Router } from "express";
import { z } from "zod";
import { supabaseAnon, supabaseAdmin } from "../lib/supabase.js";
import { clearAuthCookies, setAuthCookies } from "../lib/cookies.js";
import { env } from "../lib/env.js";
import { requireSession } from "../middleware/auth.js";

const router = Router();

const signUpSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    displayName: z.string().trim().optional(),
});

const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const forgotSchema = z.object({
    email: z.string().email(),
    redirectTo: z.string().url().optional(),
});

const exchangeCodeSchema = z.object({
    code: z.string().min(1),
});

const resetSchema = z.object({
    password: z.string().min(6),
});

router.post("/signup", async (req, res) => {
    const parsed = signUpSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid signup payload" });
    }

    const { email, password, displayName } = parsed.data;
    const { data, error } = await supabaseAnon.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: env.supabaseEmailRedirectTo,
            data: {
                display_name: displayName || "",
            },
        },
    });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
        user: data.user,
        needsEmailVerification: !data.session,
        message: data.session
            ? "Account created and signed in"
            : "Verification email sent. Please confirm your email.",
    });
});

router.post("/login", async (req, res) => {
    const parsed = signInSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid login payload" });
    }

    const { email, password } = parsed.data;
    const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
        return res.status(401).json({ error: error?.message || "Invalid credentials" });
    }

    setAuthCookies(res, data.session);

    let isAdmin = false;
    if (data.user?.id) {
        const { data: adminData } = await supabaseAdmin.rpc("has_role", {
            _user_id: data.user.id,
            _role: "admin",
        });
        isAdmin = Boolean(adminData);
    }

    return res.status(200).json({ user: data.user, isAdmin });
});

router.post("/logout", async (_req, res) => {
    clearAuthCookies(res);
    return res.status(200).json({ ok: true });
});

router.get("/me", requireSession, async (req, res) => {
    const user = req.user;
    let isAdmin = false;

    if (user?.id) {
        const { data } = await supabaseAdmin.rpc("has_role", {
            _user_id: user.id,
            _role: "admin",
        });
        isAdmin = Boolean(data);
    }

    return res.status(200).json({ user, isAdmin });
});

router.post("/forgot-password", async (req, res) => {
    const parsed = forgotSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid forgot-password payload" });
    }

    const { email, redirectTo } = parsed.data;
    const { error } = await supabaseAnon.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo || env.supabaseEmailRedirectTo,
    });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
});

router.post("/exchange-code", async (req, res) => {
    const parsed = exchangeCodeSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid exchange-code payload" });
    }

    const { data, error } = await supabaseAnon.auth.exchangeCodeForSession(parsed.data.code);
    if (error || !data.session) {
        return res.status(400).json({ error: error?.message || "Failed to exchange code" });
    }

    setAuthCookies(res, data.session);
    return res.status(200).json({ user: data.user });
});

router.post("/reset-password", requireSession, async (req, res) => {
    const parsed = resetSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid reset-password payload" });
    }

    const { password } = parsed.data;

    const { error } = await supabaseAdmin.auth.admin.updateUserById(req.user.id, {
        password,
    });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
});

export default router;
