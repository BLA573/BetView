import { supabaseAnon } from "../lib/supabase.js";
import { clearAuthCookies, setAuthCookies } from "../lib/cookies.js";

export async function requireSession(req, res, next) {
    const accessToken = req.cookies?.bv_access_token;
    const refreshToken = req.cookies?.bv_refresh_token;

    if (!accessToken && !refreshToken) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    if (accessToken) {
        const { data, error } = await supabaseAnon.auth.getUser(accessToken);
        if (!error && data?.user) {
            req.user = data.user;
            req.accessToken = accessToken;
            return next();
        }
    }

    if (refreshToken) {
        const { data: refreshData, error: refreshError } = await supabaseAnon.auth.refreshSession({
            refresh_token: refreshToken,
        });

        if (!refreshError && refreshData?.session?.access_token) {
            setAuthCookies(res, refreshData.session);
            req.user = refreshData.user;
            req.accessToken = refreshData.session.access_token;
            return next();
        }
    }

    clearAuthCookies(res);
    return res.status(401).json({ error: "Session expired" });
}
