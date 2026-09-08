const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = Number(process.env.PORT) || 1198;

const startServer = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not configured");
    }

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        throw new Error("JWT_SECRET must contain at least 32 characters");
    }

    if (
        !process.env.ADMIN_REGISTRATION_SECRET ||
        process.env.ADMIN_REGISTRATION_SECRET.length < 16
    ) {
        throw new Error("ADMIN_REGISTRATION_SECRET must contain at least 16 characters");
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
