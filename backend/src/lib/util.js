import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    const { JWT_SECRET } = process.env;
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: "7d", // Token expires in 7 days
    });

    // Set the token in an HTTP-only cookie
    res.cookie("token", token, {
        httpOnly: true,  // prevent client-side JavaScript from accessing the cookie
        //prevent XSS attacks: cross-site scripting attacks can steal cookies, so we set httpOnly to true to mitigate this risk
        secure: process.env.NODE_ENV === "development" ? false : true, // Use secure cookies in production
        sameSite: "strict", // Prevent CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    return token;
};