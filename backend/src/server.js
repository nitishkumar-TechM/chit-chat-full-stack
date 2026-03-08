import express from "express";
import path from "path";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
// import cors from "cors";
import { ENV } from "./lib/env.js";

const app = express();
// app.use(cors({
//     origin: true, // Allow all origins (you can specify your frontend URL here in production)
//     credentials: true, // Allow cookies to be sent in cross-origin requests
// }));

const __dirname = path.resolve();

const PORT = ENV.PORT || 3000; // Ensure PORT is being read from .env

app.use(express.json()); // Middleware to parse JSON bodies (req.body)
app.use(cookieParser()); // Middleware to parse cookies (req.cookies)

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// make ready for deployment
if(ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    
    app.get("*", (_, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
});