const express = require("express");
const {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);

module.exports = router;
