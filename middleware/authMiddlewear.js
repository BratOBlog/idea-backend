import { jwtVerify } from "jose";
import dotenv from "dotenv";
dotenv.config();
import User from "../models/User.js"
import { JWT_SECRET } from "../utils/getJwtSecret.js"

export const protect = async (req, res, next) => {
    try {
        const autHeader = req.headers.authorization;

        if (!autHeader || !autHeader.startsWith('Bearer ')) {
            res.status(401)
            throw new Error("Unauthorized, no token")
        }

        const token = autHeader.split(' ')[1]
        const { payload } = await jwtVerify(token, JWT_SECRET)

        const user = await User.findById(payload.userId).select('_id name email')

        if (!user) {
            res.status(401)
            throw new Error("User not found")
        }
        req.user = user;
        next();
    } catch (err) {
        console.error(err);
        res.status(401);
        next(new Error('Not authorized, token failed'))
    }
}