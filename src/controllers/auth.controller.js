const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");

const generateToken = (adminId) => {
    return jwt.sign({ adminId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

const registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required",
            });
        }

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(400).json({
                message: "Admin already exists",
            });
        }

        const admin = await Admin.create({
            name,
            email,
            password,
        });

        const token = generateToken(admin._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            message: "Admin registered successfully",
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Admin registration failed",
            error: error.message,
        });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const admin = await Admin.findOne({ email });

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

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

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
            error: error.message,
        });
    }
};

const logoutAdmin = async (req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            expires: new Date(0),
        });

        return res.status(200).json({
            message: "Admin logout successful",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Admin logout failed",
            error: error.message,
        });
    }
};

module.exports = {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
};
