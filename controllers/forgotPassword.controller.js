import User from "../models/User.js";
import nodemailer from "nodemailer";
import { generateToken } from "../utils/generateToken.js";
import { jwtVerify } from "jose";

export const forgotPassword = async (req, res) => {
    try {
        // find the user by email
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        // generate token (10 min expiry)
        const payload = { userId: user._id.toString() };
        const passwordToken = await generateToken(payload, "10m");

        // setup nodemailer
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD_APP_EMAIL,
            },
        });

        // email with reset link
        const resetLink = `https://idea-mauve.vercel.app/reset-password/${passwordToken}`;
        const mailOptions = {
            from: process.env.EMAIL,
            to: req.body.email,
            subject: "Reset Password",
            html: `
        <h1>Reset Your Password</h1>
        <p>Click on the following link to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>The link will expire in 10 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      `,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send({ message: "Email sent" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        // verify token
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.JWT_SECRET_KEY)
        );

        // find user
        const user = await User.findById(payload.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // assign new password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
