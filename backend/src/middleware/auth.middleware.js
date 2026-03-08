import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const protectRoute = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if (!decoded) return res.status(401).json({ message: "Unauthorized: Invalid token" });

        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        req.user = user;
        next();

    } catch (error) {
        console.log("Token verification error (protectRoute):", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};