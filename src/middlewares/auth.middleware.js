const jwt = require("jsonwebtoken");
const Admin = require("../models/admin.model");

const protectAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Not authorized, no token found",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const admin = await Admin.findById(decoded.adminId).select("-password");

        if (!admin) {
            return res.status(401).json({
                message: "Admin not found",
            });
        }

        req.admin = admin;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Not authorized, invalid token",
            error: error.message,
        });
    }
};

module.exports = protectAdmin;
