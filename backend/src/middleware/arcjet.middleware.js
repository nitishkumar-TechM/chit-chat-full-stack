import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

const arcjetMiddleware = async (req, res, next) => {
    try {
        const decision = await aj.protect(req, {
            requested: 1 // Deduct 1 token for this request
        });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                res.writeHead(429, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Too Many Requests" }));
                return;
            } else if (decision.reason.isBot()) {
                res.writeHead(403, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "No bots allowed" }));
                return;
            } else{
                return res.status(403).json({ message: "Access denied by security policy" });
            }
        } 
        
        if (decision.results.some(isSpoofedBot)) {
            // Paid Arcjet accounts include additional verification checks using IP data.
            // Verification isn't always possible, so we recommend checking the decision
            // separately.
            // https://docs.arcjet.com/bot-protection/reference#bot-verification
            res.writeHead(403, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Forbidden, Malicious Bot activity detected" }));
        }

        next();
    } catch (err) {
        console.log("Arcjet Protection Error:", err);
        next();
    }
};

export default arcjetMiddleware;