import * as dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import { logger } from './logger.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: process.env.GMAIL_ACCOUNT,
        pass: process.env.GMAIL_PASSWORD,
    },
});

export const sendEmail = async (to, subject, template) => {
    let result = await transporter.sendMail({
        from: process.env.GMAIL_ACCOUNT,
        to,
        subject,
        html: template,
    });

    logger.info({
        message: { ...result, title: 'Correo enviado' },
    });
};
