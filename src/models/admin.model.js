const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: 1,
            maxlength: 100,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            maxlength: 254,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email must be valid"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 8,
            select: false,
        },
    },
    {
        timestamps: true,
    },
);

adminSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

adminSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
