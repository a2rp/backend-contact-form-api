const mongoose = require("mongoose");
const Contact = require("../models/contact.model");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validStatuses = new Set(["new", "read", "resolved"]);

const isValidContactId = (id) => mongoose.isValidObjectId(id);

const submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof subject !== "string" ||
            typeof message !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !subject.trim() ||
            !message.trim() ||
            !emailPattern.test(email.trim())
        ) {
            return res.status(400).json({
                message: "Valid name, email, subject, and message are required",
            });
        }

        if (name.trim().length > 100 || subject.trim().length > 200 || message.trim().length > 5000) {
            return res.status(400).json({
                message: "Contact fields exceed the allowed length",
            });
        }

        const contact = await Contact.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
        });

        return res.status(201).json({
            message: "Contact form submitted successfully",
            contactId: contact._id,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to submit contact form",
        });
    }
};

const getAllContacts = async (req, res) => {
    try {
        const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
        const skip = (page - 1) * limit;

        const [contacts, total] = await Promise.all([
            Contact.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Contact.countDocuments(),
        ]);

        return res.status(200).json({
            message: "Contact submissions fetched successfully",
            contacts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch contact submissions",
        });
    }
};

const getSingleContact = async (req, res) => {
    try {
        if (!isValidContactId(req.params.id)) {
            return res.status(400).json({ message: "Invalid contact id" });
        }

        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                message: "Contact submission not found",
            });
        }

        return res.status(200).json({
            message: "Contact submission fetched successfully",
            contact,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch contact submission",
        });
    }
};

const updateContactStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!isValidContactId(req.params.id)) {
            return res.status(400).json({ message: "Invalid contact id" });
        }

        if (typeof status !== "string" || !validStatuses.has(status)) {
            return res.status(400).json({
                message: "Status must be new, read, or resolved",
            });
        }

        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                message: "Contact submission not found",
            });
        }

        contact.status = status;
        await contact.save();

        return res.status(200).json({
            message: "Contact status updated successfully",
            contact,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update contact status",
        });
    }
};

const deleteContact = async (req, res) => {
    try {
        if (!isValidContactId(req.params.id)) {
            return res.status(400).json({ message: "Invalid contact id" });
        }

        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                message: "Contact submission not found",
            });
        }

        await contact.deleteOne();

        return res.status(200).json({
            message: "Contact submission deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to delete contact submission",
        });
    }
};

module.exports = {
    submitContactForm,
    getAllContacts,
    getSingleContact,
    updateContactStatus,
    deleteContact,
};
