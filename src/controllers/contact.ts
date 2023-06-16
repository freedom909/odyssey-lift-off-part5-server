import nodemailer from "nodemailer";
import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import nodemailerSendgrid from "nodemailer-sendgrid";
import RecaptchaResponseV2  from "express-recaptcha";

const transporter = nodemailer.createTransport({
    service: "SendGrid",
    auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
    }
});
/**
 * Contact form page.
 * @route GET /contact
 */


export const getContact = (req: Request,res: Response) => {
    res.render("contact", {
        title:"contact",
    sitekey: process.env.RECAPTCHA_SITE,
    unknownUser: req.body.unknownUser
    }
    )};

    export const postContact = async (req: Request, res: Response) => {
        try {
          await check("name", "Name is required").notEmpty().run(req);
          await check("email", "Email is required").notEmpty().run(req);
          await check("email", "Email is not valid").isEmail().run(req);
          await check("message", "Message is required").notEmpty().run(req);
      
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            req.flash("error", errors.array()[0].msg);
            return res.redirect("/contact");
          }
      
          // ReCaptcha validation
          const recaptchaResponse:  any  = req.body["g-reCAPTCHA-response"];
          // Perform the validation here using the recaptchaResponse
      
          // Create a nodemailer transporter using SendGrid
          const transportConfig = nodemailerSendgrid({
            apiKey: process.env.SENDGRID_API_KEY as string,
          });
          const transporter = nodemailer.createTransport(transportConfig);
      
          const mailOptions = {
            from: "envkt@example.com",
            to: req.body.email,
            subject: req.body.subject,
            text: req.body.message,
          };
      
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
              req.flash("error", "Something went wrong");
              return res.redirect("/contact");
            }
            req.flash("success", "Email sent");
            res.redirect("/contact");
          });
        } catch (err) {
          console.error(err);
          req.flash("error", "Something went wrong");
          res.redirect("/contact");
        }
      };

