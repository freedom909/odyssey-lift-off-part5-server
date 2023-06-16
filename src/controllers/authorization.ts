import _ from "lodash";
import User, { UserDocument, IUser } from "../models/User";
import MailOptions  from 'nodemailer';
import validator from "validator";
import sendMail from "../services/email";
import { Request, Response, NextFunction } from "express";

import { promisify } from "bluebird";
;

export const getOauthUnlinked = (
  req: {
    params: { provider: any };
    user: { id: any };
    flash: (arg0: string, arg1: { msg: string }) => void;
  },
  res: { redirect: (arg0: string) => void },
  next: (arg0: any) => any
) => {
  const { provider } = req.params;
  User.findById(req.user.id, (err: any, user: UserDocument) => {
    if (err) {
      return next(err);
    }
    delete user[provider.toLowerCase() as keyof UserDocument];
    const tokensWithoutProviderToUnlink = user.tokens.filter(
      (token) => token.kind !== provider.toLowerCase()
    );
    // Some auth providers do not provide an email address in the user profile.
    // As a result, we need to verify that unlinking the provider is safe by ensuring
    // that another login method exists.
    if (
      !(user.email && user.password) &&
      tokensWithoutProviderToUnlink.length === 0
    ) {
      req.flash("errors", {
        msg:
          `The ${_.startCase(
            _.toLower(provider)
          )} account cannot be unlinked without another form of login enabled.` +
          " Please link another account or add an email address and password.",
      });
      return res.redirect("/account");
    }
    user.tokens = tokensWithoutProviderToUnlink;
    user
      .save()
      .then(() => {
        req.flash("info", {
          msg: `${_.startCase(_.toLower(provider))} account has been unlinked.`,
        });
        res.redirect("/account");
      })
      .catch((err: any) => {
        return next(err);
      });
  });
};



//  access the authenticated user from req.user

// Perform necessary actions and return a response
export const postUpdateProfile = (req: any, res: any, next: any) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/account");
  }
  req.body.email = validator.normalizeEmail(req.body.email);
  User.findById(
    req.user.id,
    (
      err: any,
      user: {
        email: any;
        emailVerified: boolean;
        profile: { name: any; gender: any; location: any; website: any };
        save: (arg0: (err: any) => any) => void;
      }
    ) => {
      if (err) {
        return next(err);
      }
      if (user.email !== req.body.email) {
        user.emailVerified = false;
      }
      user.email = req.body.email || "";
      user.profile.name = req.body.profile.name || "";
      user.profile.gender = req.body.profile.gender || "";
      user.profile.location = req.body.profile.location || "";
      user.profile.website = req.body.profile.website || "";
      user.save((err: { code: number }) => {
        if (err) {
          if (err.code === 11000) {
            req.flash("errors", {
              msg: "The email address you have entered is already associated with an account.",
            });
            return res.redirect("/account");
          }
          return next(err);
        }
        req.flash("success", { msg: "Profile information has been updated." });
        res.redirect("/account");
      });
    }
  );
};

/**
 * POST /account/password
 * Update current password.
 */

export const updatePassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validationErrors = [];
  if (!validator.isLength(req.body?.password, { min: 8 }))
    validationErrors.push({
      msg: "Password must be at least 8 characters long",
    });
  if (req.body.password !== req.body.confirmPassword)
    validationErrors.push({ msg: "Passwords do not match" });
  if (validationErrors.length) {
    req.flash(
      "errors",
      validationErrors.map((err) => err.msg)
    );
    return res.redirect("/account");
  }

  User.findOne(
    { email: req.body.email },
    (
      err: any,
      user: { password: any; save: (arg0: (err: any) => any) => void }
    ) => {
      if (err) return next(err);
      user.password = req.body.password;
      user.save((err: any) => {
        if (err) return next(err);

        req.flash("success", "Password changed successfully");
        return res.redirect("/account");
      });
    }
  );
};
/**
 * POST /account/delete
 * Delete user account.
 */
export const postDeleteAccount = (
  req: {
    user: { email: any };
    logout: () => void;
    flash: (arg0: string, arg1: { msg: string }) => void;
  },
  res: { redirect: (arg0: string) => void },
  next: (arg0: any) => any
) => {
  User.deleteOne({ email: req.user.email }, (err: any) => {
    if (err) {
      return next(err);
    }
    req.logout();
    req.flash("info", { msg: "Your account has been deleted." });
    res.redirect("/");
  });
};

