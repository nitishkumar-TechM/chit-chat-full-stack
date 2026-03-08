import express from "express";
import { signup, login, logout, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import arcjetMiddleware from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetMiddleware); // Apply Arcjet middleware to all auth routes

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check-auth", protectRoute, (req, res) => {
    res.status(200).json({ 
        message: "User is authenticated",
        data: {
            _id: req.user._id,
            fullname: req.user.fullname,
            email: req.user.email,
            profilePic: req.user.profilePic,
        }
    }); 
});

export default router;