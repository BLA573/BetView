import { env } from "./env.js";

const oneWeekSeconds = 60 * 60 * 24 * 7;

export function setAuthCookies(res, session) {
    const baseOptions = {
        httpOnly: true,
        secure: env.cookieSecure,
        sameSite: "lax",
        path: "/",
        maxAge: oneWeekSeconds * 1000,
    };

    if (env.cookieDomain) {
        baseOptions.domain = env.cookieDomain;
    }

    res.cookie("bv_access_token", session.access_token, baseOptions);
    res.cookie("bv_refresh_token", session.refresh_token, baseOptions);
}

export function clearAuthCookies(res) {
    const baseOptions = {
        httpOnly: true,
        secure: env.cookieSecure,
        sameSite: "lax",
        path: "/",
    };

    if (env.cookieDomain) {
        baseOptions.domain = env.cookieDomain;
    }

    res.clearCookie("bv_access_token", baseOptions);
    res.clearCookie("bv_refresh_token", baseOptions);
}
