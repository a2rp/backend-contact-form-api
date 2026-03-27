const Contact = require("../models/contact.model");

const submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                message: "Name, email, subject, and message are required",
            });
        }

        const contact = await Contact.create({
            name,
            email,
            subject,
            message,
        });

        return res.status(201).json({
            message: "Contact form submitted successfully",
            contact,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to submit contact form",
            error: error.message,
        });
    }
};

const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Contact submissions fetched successfully",
            contacts,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch contact submissions",
            error: error.message,
        });
    }
};

const getSingleContact = async (req, res) => {
    try {
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
            error: error.message,
        });
    }
};

const updateContactStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                message: "Contact submission not found",
            });
        }

        contact.status = status || contact.status;

        await contact.save();

        return res.status(200).json({
            message: "Contact status updated successfully",
            contact,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update contact status",
            error: error.message,
        });
    }
};

const deleteContact = async (req, res) => {
    try {
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
            error: error.message,
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
