const express = require("express");
const rateLimit = require("express-rate-limit");
const {
    submitContactForm,
    getAllContacts,
    getSingleContact,
    updateContactStatus,
    deleteContact,
} = require("../controllers/contact.controller");
const protectAdmin = require("../middlewares/auth.middleware");

const router = express.Router();
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many contact requests. Try again later." },
});

// public route
router.post("/", contactLimiter, submitContactForm);

// admin routes
router.get("/", protectAdmin, getAllContacts);
router.get("/:id", protectAdmin, getSingleContact);
router.put("/:id/status", protectAdmin, updateContactStatus);
router.delete("/:id", protectAdmin, deleteContact);

module.exports = router;
