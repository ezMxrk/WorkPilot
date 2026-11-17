
const {
    registerUser,
    loginUser,
    getUserById,
    changeUserPassword,
    requestPasswordReset,
    resetUserPassword
} = require("../services/authService");

async function register(req, res, next) {
    try {
        const user = await registerUser(req.body);

        return res.status(201).json({
            message: "Account created successfully.",
            user
        });
    } catch (error) {
        next(error);
    }
}

async function login(req, res, next) {
    try {
        const result = await loginUser(req.body);

        if (!result) {
            return res.status(401).json({
                error: "Invalid email or password."
            });
        }

        return res.status(200).json({
            message: "Login successful.",
            ...result
        });
    } catch (error) {
        next(error);
    }
}

async function getMe(req, res, next) {
    try {
        const user = await getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({
                error: "User not found."
            });
        }

        return res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
}

async function changePassword(req, res, next) {
    try {
        const {
            currentPassword,
            newPassword
        } = req.body;

        const passwordChanged = await changeUserPassword(
            req.user.id,
            currentPassword,
            newPassword
        );

        if (!passwordChanged) {
            return res.status(400).json({
                error: "Current password is incorrect."
            });
        }

        return res.status(200).json({
            message: "Password updated successfully."
        });
    } catch (error) {
        next(error);
    }
}

async function forgotPassword(req, res, next) {
    try {
        const { email } = req.body;

        const message = await requestPasswordReset(email);

        return res.status(200).json({ message });
    } catch (error) {
        next(error);
    }
}

async function resetPassword(req, res, next) {
    try {
        const {
            token,
            newPassword
        } = req.body;

        const passwordReset = await resetUserPassword(
            token,
            newPassword
        );

        if (!passwordReset) {
            return res.status(400).json({
                error: "This password reset link is invalid or has expired."
            });
        }

        return res.status(200).json({
            message: "Password reset successfully. Please log in again."
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login,
    getMe,
    changePassword,
    forgotPassword,
    resetPassword
};
