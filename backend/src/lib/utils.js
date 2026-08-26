import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId,res) => {
    const {JWT_SECRET } = ENV;
    if(!JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }
    const token = jwt.sign({ userId },process.env.JWT_SECRET,{
        expiresIn: "7d",
    });

    res.cookie("jwt", token,{
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true, // prevent XSS attacks: cross-site scripting
        sameSite: "strict", // prevent CSRF attacks: cross-site request forgery
        secure: process.env.NODE_ENV === "development" ? false : true, // set to true in production
    });

    return token;
};