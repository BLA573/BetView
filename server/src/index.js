import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./lib/env.js";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(
    cors({
        origin: env.frontendOrigin,
        credentials: true,
    }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
    res.status(200).json({ ok: true });
});

app.use("/api/auth", authRoutes);

app.use((err, _req, res, _next) => {
    console.error("API error", err);
    res.status(500).json({ error: "Internal server error" });
});

app.listen(env.port, () => {
    console.log(`Backend API running on http://localhost:${env.port}`);
});
