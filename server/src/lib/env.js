import dotenv from "dotenv";

dotenv.config({ path: ".env.server" });

function getEnv(name, fallback = "") {
    const value = process.env[name] ?? fallback;
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export const env = {
    port: Number(process.env.PORT || 8787),
    frontendOrigin: getEnv("FRONTEND_ORIGIN", "http://localhost:5173"),
    supabaseUrl: getEnv("SUPABASE_URL"),
    supabaseAnonKey: getEnv("SUPABASE_ANON_KEY"),
    supabaseServiceRoleKey: getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    supabaseEmailRedirectTo: process.env.SUPABASE_EMAIL_REDIRECT_TO || "http://localhost:5173/auth",
    cookieDomain: process.env.COOKIE_DOMAIN || "",
    cookieSecure: process.env.COOKIE_SECURE === "true",
};
