const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT === undefined ? 1198 : Number(process.env.PORT);

const startServer = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not configured");
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        throw new Error("JWT_SECRET must contain at least 32 characters");
    }

    if (/^(replace_with|change_me|your[_-])/i.test(process.env.JWT_SECRET)) {
        throw new Error("Replace the example JWT_SECRET with a unique random secret");
    }

    if (
        !process.env.ADMIN_REGISTRATION_SECRET ||
        process.env.ADMIN_REGISTRATION_SECRET.length < 32
    ) {
        throw new Error("ADMIN_REGISTRATION_SECRET must contain at least 32 characters");
    }

    if (/^(replace_with|change_me|your[_-])/i.test(process.env.ADMIN_REGISTRATION_SECRET)) {
        throw new Error("Replace the example ADMIN_REGISTRATION_SECRET with a unique random secret");
    }

    if (process.env.NODE_ENV === "production" && !process.env.CLIENT_ORIGIN?.trim()) {
        throw new Error("CLIENT_ORIGIN must be configured in production");
    }

    if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
        throw new Error("PORT must be an integer from 1 to 65535");
    }

    await connectDB();

    app.listen(PORT, () => {
        console.log(`[API] Server running on port ${PORT}`);
    });
};

startServer().catch((error) => {
    console.error("[API] Server startup failed:", error.message);
    process.exit(1);
});
