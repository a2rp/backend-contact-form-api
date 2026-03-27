const express = require("express");
const {
    submitContactForm,
    getAllContacts,
    getSingleContact,
    updateContactStatus,
    deleteContact,
} = require("../controllers/contact.controller");
const protectAdmin = require("../middlewares/auth.middleware");

const router = express.Router();

// public route
router.post("/", submitContactForm);

// admin routes
router.get("/", protectAdmin, getAllContacts);
router.get("/:id", protectAdmin, getSingleContact);
router.put("/:id/status", protectAdmin, updateContactStatus);
router.delete("/:id", protectAdmin, deleteContact);

module.exports = router;
