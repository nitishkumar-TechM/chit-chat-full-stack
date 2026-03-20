import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllContacts = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        // $ne = not equal to, so we exclude the logged-in user from the results

        res.status(200).json(filteredUsers);

    }catch (error) {
        console.log("Error in getAllContacts:", error);
        res.status(500).json({ message: "Error fetching contacts" });
    }
}

export const getMessagesByUserId = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const {id: otherUserId} = req.params;

        // Fetch messages between the logged-in user and the specified user
        const messages = await Message.find({
            $or: [
                { senderId: loggedInUserId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: loggedInUserId }
            ]
        }).sort({ createdAt: 1 }); // Sort messages by creation time

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessagesByUserId:", error);
        res.status(500).json({ message: "Error fetching messages" });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const {id: receiverId} = req.params;
        const {text, image} = req.body;

        let imageUrl;
        if (image) {
            // Handle image upload and get the URL (this is a placeholder, implement your own logic)
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        await newMessage.save();

        //todo: send message in real time if user is online - socket.io

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage:", error);
        res.status(500).json({ message: "Error sending message" });
    }
}

export const getChatParteners = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // Find all messages where the logged-in user is either the sender or receiver
        const messages = await Message.find({
            $or: [
                { senderId: loggedInUserId },
                { receiverId: loggedInUserId }
            ]
        });

        // Extract unique user IDs of chat partners
        const chatPartnerIds = [
            ...new Set(
                messages.map(msg =>
                    msg.senderId.toString() === loggedInUserId.toString()
                     ? msg.receiverId.toString()
                     : msg.senderId.toString()
                )
            )
        ];

        // Fetch user details of chat partners (exclude password)
        const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");
        
        res.status(200).json(chatPartners);
    } catch (error) {
        console.log("Error in getChatParteners:", error);
        res.status(500).json({ message: "Error fetching chat partners" });
    }
}