
const express = require("express");

const {
    register,
    login,
    getMe
} = require("../controllers/authController");

const validateRequest = require("../middleware/validateRequest");
const authenticateToken = require("../middleware/authenticateToken");

const {
    registerSchema,
    loginSchema
} = require("../validators/authValidator");

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);

// Richiede un JWT valido
router.get("/me", authenticateToken, getMe);

module.exports = router;
