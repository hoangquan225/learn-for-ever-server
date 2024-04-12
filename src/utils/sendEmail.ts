import nodemailer, { Transporter } from 'nodemailer';
import dotenv from './dotenv';

dotenv.config();

const {
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  EMAIL_HOST,
  EMAIL_PORT = 465,
  EMAIL_ADDRESS = 'hoangquan225.qh@gmail.com',
} = process.env;

const sendEmail = async (email: string, subject: string, html: string) => {
  const transport: Transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: 'smtp.gmail.io',
    port: 465,
    secure: false,
    auth: {
      user: EMAIL_ADDRESS,
      pass: 'ffjbvkshtkmqmscv',
    },
  });

  const mailOptions = {
    from: EMAIL_ADDRESS,
    to: email,
    subject: subject,
    html: html,
  };

  return await transport.sendMail(mailOptions);
};

export default sendEmail;
