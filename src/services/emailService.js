
const nodemailer = require("nodemailer");
const env = require("../config/env");

let transporter = null;

function getTransporter() {
    if (env.EMAIL_MODE !== "smtp") {
        return null;
    }

    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_PORT === 465,
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASSWORD
            }
        });
    }

    return transporter;
}

async function sendPasswordResetEmail(email, resetUrl) {
    if (env.EMAIL_MODE === "console") {
        console.log("\n========================================");
        console.log("WORKPILOT - PASSWORD RESET");
        console.log(`Recipient: ${email}`);
        console.log(`Reset link: ${resetUrl}`);
        console.log("========================================\n");
        return;
    }

    const mailTransporter = getTransporter();

    await mailTransporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject: "Reset your WorkPilot password",
        text: [
            "We received a request to reset your WorkPilot password.",
            "",
            "Use the following link to choose a new password:",
            resetUrl,
            "",
            `This link expires in ${env.PASSWORD_RESET_TOKEN_TTL_MINUTES} minutes.`,
            "",
            "If you did not request this change, you can ignore this email."
        ].join("\n"),
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #1f2937;">
                <h1 style="font-size: 24px;">Reset your password</h1>
                <p>We received a request to reset your WorkPilot password.</p>
                <p>Click the button below to choose a new password.</p>
                <p style="margin: 32px 0;">
                    <a href="${resetUrl}"
                       style="background: #2563eb; color: #ffffff; padding: 12px 22px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                        Reset password
                    </a>
                </p>
                <p>This link expires in ${env.PASSWORD_RESET_TOKEN_TTL_MINUTES} minutes.</p>
                <p>If you did not request this change, you can safely ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 28px 0;" />
                <p style="font-size: 12px; color: #6b7280;">WorkPilot</p>
            </div>
        `
    });
}

module.exports = {
    sendPasswordResetEmail
};
