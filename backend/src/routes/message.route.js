import express from "express";
import { getAllContacts, getMessagesByUserId, sendMessage, getChatParteners } from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// the middlewares execute in order - so requests will first go through protectRoute to
//  ensure the user is authenticated before accessing any of the message routes.
router.use(protectRoute); // Apply authentication middleware to all routes in this router

router.get("/contacts", getAllContacts);
router.get("/chats", getChatParteners);
router.get("/:id", getMessagesByUserId);

router.post("/send/:id", sendMessage);

export default router;  