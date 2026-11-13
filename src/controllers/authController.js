
const {
    registerUser,
    loginUser
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

module.exports = {
    register,
    login
};
