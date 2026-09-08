const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth.routes");
const contactRoutes = require("./routes/contact.routes");

const app = express();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many authentication requests. Try again later." },
});

const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message: "Too many contact requests. Try again later." },
});

app.use((req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (body) => {
        const payload =
            body && typeof body === "object" && !Array.isArray(body)
                ? { apiUrl: req.originalUrl, ...body }
                : { apiUrl: req.originalUrl, data: body };

        return originalJson(payload);
    };

    res.on("finish", () => {
        console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode}`);
    });

    next();
});

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
        credentials: true,
    }),
);

app.get("/", (req, res) => {
    res.json({
        message: "Contact Form API is running",
    });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/contacts", contactLimiter, contactRoutes);

app.use((req, res) => {
    return res.status(404).json({
        message: "Route not found",
    });
});

app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        return res.status(400).json({
            message: "Invalid JSON request body",
        });
    }

    console.error("[API] Unhandled server error:", error.message);
    return res.status(500).json({
        message: "Internal server error",
    });
});

module.exports = app;
