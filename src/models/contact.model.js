const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: 100,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            maxlength: 254,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email must be valid"],
        },
        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true,
            maxlength: 200,
        },
        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
            maxlength: 5000,
        },
        status: {
            type: String,
            enum: ["new", "read", "resolved"],
            default: "new",
        },
    },
    {
        timestamps: true,
    },
);

contactSchema.index({ status: 1, createdAt: -1 });

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
