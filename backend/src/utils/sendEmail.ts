import nodemailer from 'nodemailer';

interface MailOptions {
    to: string;
    subject: string;
    text: string;
    html: string;
}

const sendEmail = async (options: MailOptions) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const message = {
        from: `Refresh Kid Learning <no-reply@refreshkid.com>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
    };

    try {
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error("Email could not be sent:", error);
        // In a real app, you might have more robust error handling or a fallback
        throw new Error("Failed to send password reset email.");
    }
};

export default sendEmail;
