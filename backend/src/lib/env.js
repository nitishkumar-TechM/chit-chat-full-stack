import "dotenv/config";

export const ENV = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI,
    NODE_ENV: process.env.NODE_ENV || "development",
    JWT_SECRET: process.env.JWT_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
    EMAIL_SUBJECT: process.env.EMAIL_SUBJECT,
    CLIENT_URL: process.env.CLIENT_URL,
};