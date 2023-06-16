
import nodemailerSendgrid from "nodemailer-sendgrid";
import nodemailer, { TransportOptions, SendMailOptions } from "nodemailer";
import { Options } from "nodemailer/lib/smtp-transport";
import User, { UserDocument ,IUser} from "../models/User";
import crypto from 'crypto';
import dotenv from "dotenv";
import {Response, Request,NextFunction} from 'express'; 
import validator from "validator";
import mailChecker from 'mailchecker';
import { promisify } from "bluebird";
dotenv.config();

const sendMail = async (settings: {
  successfulType: string;
  failedType: string;
  successfulmessage: string;
  failedmessage: string;
  errorType: string;
  errormessage: string;
  mailOptions: SendMailOptions;
  req: any;
}): Promise<any> => {
  const transportConfig: Options = process.env.SENDGRID_API_KEY
    ? nodemailerSendgrid({ apiKey: process.env.SENDGRID_API_KEY })
    : {
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      };

  const transporter = nodemailer.createTransport(transportConfig);

  try {
    await transporter.sendMail(settings.mailOptions);
    console.log('Email sent successfully');
    // Perform any additional actions after the email is sent successfully
  } catch (error) {
    console.error('Error sending email:', error);
    // Handle the error appropriately
  }
};
export const sendForgotPasswordEmail = (user: any, req: Request) => {
  if (!user) {
    return;
  }
  const mailOptions = {
    to: ":admin@gmail.com",
    from: "admin@gmail.com",
    subject: "Forgot Password",
    text: "Forgot Password, please enter your password for this account `mailto:admin@gmail.com",
  };
  const mailSettings = {
    successfulType: "success",
    successfulmessage: "Your email ${req.user.email} has been verified",
    failedType: "Success! Your password has been changed.",
    failedmessage: "Your email could not be verified",
    errorType: "error",
    errormessage: "Something went wrong",
    mailOptions,
    req,
  };
  return sendMail(mailSettings);
};


export default {sendMail,sendForgotPasswordEmail}
