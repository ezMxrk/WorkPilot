
const express = require("express");
const { rateLimit } = require("express-rate-limit");

const {
    register,
    login,
    getMe,
    changePassword,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");

const validateRequest = require("../middleware/validateRequest");
const authenticateToken = require("../middleware/authenticateToken");

const {
    registerSchema,
    loginSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} = require("../validators/authValidator");

const router = express.Router();

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many password reset requests. Please try again later."
    }
});

const resetPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many password reset attempts. Please try again later."
    }
});

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

router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    validateRequest(forgotPasswordSchema),
    forgotPassword
);

router.post(
    "/reset-password",
    resetPasswordLimiter,
    validateRequest(resetPasswordSchema),
    resetPassword
);

// Richiede un JWT valido.
router.get(
    "/me",
    authenticateToken,
    getMe
);

// Cambio password: richiede un JWT valido.
router.put(
    "/change-password",
    authenticateToken,
    validateRequest(changePasswordSchema),
    changePassword
);

module.exports = router;
