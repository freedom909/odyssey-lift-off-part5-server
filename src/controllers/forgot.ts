import _ from "lodash";
import User, { UserDocument, IUser } from "../models/User";
import MailOptions  from 'nodemailer';
import validator from "validator";
import sendMail from "../services/email";
import { Request, Response, NextFunction } from "express";

import { promisify } from "bluebird";

export const getResetPassword = (req: any, res: any, next: any) => {
    // protected route that requires authentication
    if (req.auth && req.auth.authenticated()) {
      return res.redirect("/");
    }
    const validationErrors = [];
    if (!validator.isHexadecimal(req.params.token))
      validationErrors.push({ msg: "Invalid Token.  Please retry." });
    if (validationErrors.length) {
      req.flash("error", validationErrors);
      return res.redirect("/forgot");
    }
    User.findOne({ token: req.params.token })
      .where("passwordResetTokenExpiration")
      .gt(Date.now())
      .exec()
      .then((err: any) => {
        if (err) {
          return next(err);
        }
  
        res.render("account/reset", {
          title: "Reset Password",
          message: "Reset Password",
        });
      });
  };