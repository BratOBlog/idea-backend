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
        const userName = user.name

        const mailOptions = {
            from: process.env.EMAIL,
            to: req.body.email,
            subject: "Password reset from Idea Drop page",
            html: `
        <h1>Hi ${userName}!</h1>
        <p>To reset your password click on the following link:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>The link will expire in 10 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
             <p>Best regards,<br/> The Idea Team</p>
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
        const { password } = req.body;

        // verify token
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.JWT_SECRET)
        );


        // find user
        const user = await User.findById(payload.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // assign new password (will be hashed by pre-save hook)
        user.password = password;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
