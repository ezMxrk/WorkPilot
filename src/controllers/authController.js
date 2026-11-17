const {
    registerUser,
    loginUser,
    getUserById,
    changeUserPassword
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

module.exports = {
    register,
    login,
    getMe,
    changePassword
};