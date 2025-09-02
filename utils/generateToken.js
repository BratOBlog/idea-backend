import { SignJWT } from "jose";
import dotenv from 'dotenv';


dotenv.config();

//Convert secret into Uint8Array


const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)


/**
 * Generates a JWT.
 * @param {Object} payload - Data to embed in the token.
 * @param {string} expiresIn - Expiration time (e.g., '15m', '7d', '30d')
 */


export const generateToken = async (payload, expiresIn = "10m") => {
    return await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime(expiresIn).sign(JWT_SECRET)

}