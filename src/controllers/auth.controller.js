const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateToken = (adminId) => {
    return jwt.sign({ adminId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
        algorithm: "HS256",
    });
};

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const registerAdmin = async (req, res) => {
    try {
        if (req.get("x-admin-registration-secret") !== process.env.ADMIN_REGISTRATION_SECRET) {
            return res.status(403).json({
                message: "Admin registration is not permitted",
            });
        }

        const { name, email, password } = req.body || {};
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            name.trim().length < 1 ||
            name.trim().length > 100 ||
            normalizedEmail.length > 254 ||
            !emailPattern.test(normalizedEmail) ||
            [...password].length < 8 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                message: "Provide a name (1-100 characters), valid email, and password (8-72 UTF-8 bytes)",
            });
        }

        if (await Admin.exists({})) {
            return res.status(409).json({
                message: "Admin registration is closed after the initial setup",
            });
        }

        const existingAdmin = await Admin.findOne({ email: normalizedEmail });

        if (existingAdmin) {
            return res.status(400).json({
                message: "Admin already exists",
            });
        }

        const admin = await Admin.create({
            name: name.trim(),
            email: normalizedEmail,
            password,
        });

        const token = generateToken(admin._id);

        res.cookie("token", token, cookieOptions);

        return res.status(201).json({
            message: "Admin registered successfully",
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
            },
        });
    } catch (error) {
        console.error("Admin registration failed:", error);
        if (error.code === 11000) {
            return res.status(409).json({
                message: "An admin with this email already exists",
            });
        }

        return res.status(500).json({
            message: "Admin registration failed",
        });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            normalizedEmail.length > 254 ||
            !emailPattern.test(normalizedEmail) ||
            !password ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                message: "A valid email and password of at most 72 UTF-8 bytes are required",
            });
        }

        const admin = await Admin.findOne({ email: normalizedEmail }).select("+password");

        if (!admin) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const isPasswordMatched = await admin.comparePassword(password);

        if (!isPasswordMatched) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const token = generateToken(admin._id);

        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            message: "Admin login successful",
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
            },
        });
    } catch (error) {
        console.error("Admin login failed:", error);
        return res.status(500).json({
            message: "Admin login failed",
        });
    }
};

const logoutAdmin = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: cookieOptions.secure,
            sameSite: cookieOptions.sameSite,
            path: "/",
        });

        return res.status(200).json({
            message: "Admin logout successful",
        });
    } catch (error) {
        console.error("Admin logout failed:", error);
        return res.status(500).json({
            message: "Admin logout failed",
        });
    }
};

module.exports = {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
};
