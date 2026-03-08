import { resendClient, sender } from "../lib/resend.js";
import { ENV } from "../lib/env.js";

export const sendWelcomeEmail = async (recipientEmail, name, clientURL) => {
    try {
        const { createWelcomeEmailTemplate } = await import("./emailTemplates.js");

        const emailContent = createWelcomeEmailTemplate(name, clientURL);

        await resendClient.emails.send({
            from: `${sender.name} <${sender.email}>`,
            to: [`${recipientEmail}`],
            subject: ENV.EMAIL_SUBJECT,
            html: emailContent,
        });

        console.log(`Welcome email sent to ${recipientEmail}`);
    } catch (error) {
        console.error(`Failed to send welcome email to ${recipientEmail}:`, error);
        throw new Error("Failed to send welcome email");
    }
};