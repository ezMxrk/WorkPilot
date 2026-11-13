
const express = require("express");

const {
    register,
    login
} = require("../controllers/authController");

const validateRequest = require("../middleware/validateRequest");

const {
    registerSchema,
    loginSchema
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

module.exports = router;
