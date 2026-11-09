const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const authRoutes = require("./routes/auth.routes");
const contactRoutes = require("./routes/contact.routes");

const app = express();
app.disable("x-powered-by");
app.use(helmet());

const allowedOrigins = (
    process.env.CLIENT_ORIGIN ||
    (process.env.NODE_ENV === "production" ? "" : "http://localhost:5173")
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many authentication requests. Try again later." },
});

const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
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
        origin: (origin, callback) => {
            callback(null, !origin || allowedOrigins.includes(origin));
        },
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
    if (res.headersSent) {
        return next(error);
    }

    if (error.type === "entity.too.large") {
        return res.status(413).json({
            message: "Request body is too large",
        });
    }

    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        return res.status(400).json({
            message: "Invalid JSON request body",
        });
    }

    console.error("[API] Unhandled server error:", error);
    return res.status(500).json({
        message: "Internal server error",
    });
});

module.exports = app;
