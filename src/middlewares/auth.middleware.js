const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Admin = require("../models/admin.model");

const protectAdmin = async (req, res, next) => {
    try {
        const token = req.cookies && req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Not authorized, no token found",
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET, {
                algorithms: ["HS256"],
            });
        } catch {
            return res.status(401).json({
                message: "Not authorized, invalid token",
            });
        }

        if (!decoded || typeof decoded.adminId !== "string" || !mongoose.isValidObjectId(decoded.adminId)) {
            return res.status(401).json({
                message: "Not authorized, invalid token",
            });
        }

        const admin = await Admin.findById(decoded.adminId).select("-password");

        if (!admin) {
            return res.status(401).json({
                message: "Admin not found",
            });
        }

        req.admin = admin;
        next();
    } catch (error) {
        return next(error);
    }
};

module.exports = protectAdmin;
