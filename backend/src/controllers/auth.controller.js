import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/util.js";
import { ENV } from "../lib/env.js";
import { sendWelcomeEmail } from "../emails/emailHandler.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    // console.log("Signup controller called with data:", req.body); // Debug log to check incoming data
    const { fullname, email, password } = req.body;
    // Here you would typically save the user to the database

    try {
        // Simulate user creation logic
        if (!fullname || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if(password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        //check if email is valid: regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        //check if email already exists in the database (this is just a placeholder, you would actually query your database)
        const existingUser = await User.findOne({ email }); // Replace with actual database check
        if(existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Here you would hash the password and save the user to the database
        // For example:
        // const passwordHash = await bcrypt.hash(password, 10);
        // const newUser = new User({ fullname, email, passwordHash });
        // await newUser.save();
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const newUser = new User({ fullname, email, password: passwordHash });
        if (newUser) {
            //before CR:(code review)
            // generateToken(newUser._id, res); // You would implement this function to generate a JWT token for the user
            // await newUser.save();

            // after CR:
            // Persist user first, then issue auth cookie
            const savedUser = await newUser.save();
            generateToken(savedUser._id, res);

            // Simulate successful user creation
            res.status(201).json({ 
                message: "User registered successfully",
                data: {
                    _id: newUser._id,
                    fullname: newUser.fullname,
                    email: newUser.email,
                    profilePic: newUser.profilePic,
                }            
            });

            // todo: send welcome email here

            try{
                await sendWelcomeEmail(savedUser.email, savedUser.fullname, ENV.CLIENT_URL);
            } catch (error) {
                console.error("Error sending welcome email:", error);
            }
        } else {
            return res.status(500).json({ message: "Failed to create user" });
        }

    } catch (error) {
        console.error("Error during signup controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
    
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email }); // Replace with actual database query
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
            // Note: Never reveal whether the email or password was incorrect to avoid giving hints to attackers
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        generateToken(user._id, res); // You would implement this function to generate a JWT token for the user

        res.status(200).json({ 
            message: "Login successful",
            data: {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                profilePic: user.profilePic,
            }            
        });

    } catch (error) {
        console.error("Error during login controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = (_, res) => {
    res.cookie("token", "", {maxAge:0});
    res.status(200).json({ message: "Logout successful" });
};

// Update user profile picture
export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        if (!profilePic) {
            return res.status(400).json({ message: "Profile picture URL is required" });
        }

        const userId = req.user._id; // Assuming you have middleware to set req.user based on the auth token

        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
            public_id: `profile_${userId}`,
        });

        // Optimize delivery by resizing and applying auto-format and auto-quality
        const optimizeUrl = cloudinary.url(`profile_${userId}`, {
            fetch_format: 'auto',
            quality: 'auto'
        });

        console.log(optimizeUrl);

        // Transform the image: auto-crop to square aspect_ratio
        const autoCropUrl = cloudinary.url(`profile_${userId}`, {
            crop: 'auto',
            gravity: 'auto',
            width: 500,
            height: 500,
        });

        const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Profile picture updated successfully", data: updatedUser });
    } catch (error) {
        console.error("Error updating profile picture:", error);
        res.status(500).json({ message: "Internal server error" });
    }

};