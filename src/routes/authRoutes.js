const express = require("express");

const {
    register,
    login,
    getMe,
    changePassword
} = require("../controllers/authController");

const validateRequest = require("../middleware/validateRequest");
const authenticateToken = require("../middleware/authenticateToken");

const {
    registerSchema,
    loginSchema,
    changePasswordSchema
} = require("../validators/authValidator");

const router = express.Router();

router.post(
    "/register",
    validateRequest(registerSchema),
    register
);

router.post(
    "/login",
    validateRequest(loginSchema),
    login
);

// Richiede un JWT valido
router.get(
    "/me",
    authenticateToken,
    getMe
);

// Cambio password: richiede un JWT valido
router.put(
    "/change-password",
    authenticateToken,
    validateRequest(changePasswordSchema),
    changePassword
);

module.exports = router;