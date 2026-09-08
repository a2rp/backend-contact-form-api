const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateToken = (adminId) => {
    return jwt.sign({ adminId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
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

        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !emailPattern.test(email.trim()) ||
            password.length < 6
        ) {
            return res.status(400).json({
                message: "Valid name, email, and password of at least 6 characters are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
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
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const admin = await Admin.findOne({ email: normalizedEmail });

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
