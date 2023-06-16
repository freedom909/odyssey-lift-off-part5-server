import async, { any } from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import  User,{ UserDocument, AuthToken } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import {
  ValidationError,
  body,
  check,
  validationResult,
} from "express-validator";
import "../config/passport";
import { CallbackError, SaveOptions } from "mongoose";
import NativeError from "mongoose";
import { Session } from "express-session";
import flash from "express-flash";

/**
 * Login page.
 * @route GET /login
 */
export const getLogin = (req: Request, res: Response): void => {
  if (req.user) {
    return res.redirect("/");
  }
  res.render("account/login", {
    title: "Login",
  });
};
/**
 * Sign in using email and password.
 * @route POST /login
 */
export const postLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await check("email", "Email is not valid").isEmail().run(req);
  await check("password", "Password cannot be blank")
    .isLength({ min: 1 })
    .run(req);
  await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash(
      "errors",
      errors
        .array()
        .map((error) => error.msg)
        .join("\n")
    );
    return res.redirect("/login");
  }

  passport.authenticate(
    "local",
    (err: Error, user: UserDocument, info: IVerifyOptions) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash("errors", info.message);
        return res.redirect("/login");
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Success! You are logged in.");
        const session = req.session as Session & { returnTo?: string };
        res.redirect(session.returnTo || "/");
      });
    }
  )(req, res, next);
};
/**
 * Log out.
 * @route GET /logout
 */
export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.json({
      status: 401,
      logged: false,
      message: "You are not authorized to access the app. Can't logout",
    });
  } else {
    req.logout((err: Error) => {
      if (err) {
        return next(err);
      }
      req.flash("info", "You have been logged out.");
      res.redirect("/");
    });
  }
}

export const getSignup = (req: Request, res: Response): void => {
  if (req.user) {
    return res.redirect("/");
  }
  res.render("account/signup", {
    title: "Create Account",
  });
};
export const postSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await check("email", "Email is not valid").isEmail().run(req);
  await check("password", "Password must be at least 4 characters long")
    .isLength({ min: 4 })
    .run(req);
  await check("confirmPassword", "Passwords do not match")
    .equals(req.body.password)
    .run(req);
  await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash(
      "errors",
      errors
        .array()
        .map((error) => error.msg)
        .join("\n")
    );
    return res.redirect("/signup");
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
  });

  User.findOne(
    { email: req.body.email },
    (err: NativeError, existingUser: UserDocument) => {
      if (err) {
        return next(err);
      }
      if (existingUser) {
        req.flash("errors", "Account with that email address already exists.");
        return res.redirect("/signup");
      }
      user
        .save()
        .then(() => {
          req.logIn(user, (err) => {
            if (err) {
              return next(err);
            }
            req.flash("success", "Success! You are logged in.");
            res.redirect("/");
          });
        })
        .catch((err: Error) => {
          next(err);
        });
    }
  );
};
/**
 * Profile page.
 * @route GET /account
 */
export const getAccount = (req: Request, res: Response): void => {
  res.render("account/profile", {
    title: "Account Management",
  });
};
/**
 * Update profile information.
 * @route POST /account/profile
 */
export const postUpdateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await check("email", "Please enter a valid email address.")
    .isEmail()
    .run(req);
  await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash(
      "errors",
      errors.array().map((err: ValidationError) => err.msg)
    );
    return res.redirect("/account");
  }

  const user = req.user as UserDocument;
  User.findById(user.id, (err: NativeError, user: UserDocument) => {
    if (err) {
      return next(err);
    }
    user.email = req.body.email || "";
    user.profile.name = req.body.name || "";
    user.profile.gender = req.body.gender || "";
    user.profile.location = req.body.location || "";
    user.profile.website = req.body.website || "";
    user
      .save()
      .then(() => {
        req.flash("success", "Profile information has been updated.");
        res.redirect("/account");
      })
      .catch((err) => {
        next(err);
      });
  });
};
/**
 * Update current password.
 * @route POST /account/password
 */
export const postUpdatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await check("password", "Password must be at least 6 characters long")
    .isLength({ min: 6 })
    .run(req);
  await check("confirmPassword", "Passwords do not match")
    .equals(req.body.password)
    .run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash(
      "errors",
      errors
        .array()
        .map((err: ValidationError) => err.msg)
        .join("\n")
    ); // TODO );
    return res.redirect("/account");
  }

  const user = req.user as UserDocument;
  User.findById(user.id, (err: NativeError, user: UserDocument) => {
    if (err) {
      return next(err);
    }
    user.password = req.body.password;
    user
      .save()
      .then(() => {
        req.flash("success", "Password has been changed.");
        res.redirect("/account");
      })
      .catch((err) => {
        next(err);
      });
  });
};
/**
 * Delete user account.
 * @route POST /account/delete
 */
export const postDeleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserDocument;
  User.deleteOne({ _id: user.id }, (err: any) => {
    if (err) {
      return next(err);
    }
    if (!req.user) {
      res.json({ status: 404, message: "You are not logged in" });
    }
    req.logout((err: Error) => {
      if (err) {
        return next(err);
      }
      req.flash("info", "Your account has been deleted.");
      res.redirect("/");
    });
  });
};

/**
 * Unlink OAuth provider.
 * @route GET /account/unlink/:provider
 */
export const getOauthUnlink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const provider = req.params.provider;
  const user = req.user as UserDocument;
  User.findById(user.id, (err: NativeError, user: any) => {
    if (err) {
      return next(err);
    }
    user[provider] = undefined;
    user.tokens = user.tokens.filter(
      (token: AuthToken) => token.kind !== provider
    );
    user.save((err: WriteError) => {
      if (err) {
        return next(err);
      }
      req.flash("info", `${provider} account has been unlinked.`);
      res.redirect("/account");
    });
  });
};

/**
 * Reset Password page.
 * @route GET /reset/:token
 */
export const getReset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  User.findOne({ passwordResetToken: req.params.token })
    .where("passwordResetExpires")
    .gt(Date.now())
    .exec()
    .then((user: UserDocument | null) => {
      if (!user) {
        req.flash("errors", "Password reset token is invalid or has expired.");
        return res.redirect("/forgot");
      }
      res.render("account/reset", {
        title: "Password Reset",
      });
    })
    .catch((err: WriteError) => {
      return next(err);
    });

  /**
   * Reset Password.
   * @route POST /reset/:token
   */
};
export const postReset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Function body
  await check("password", "Password must be 6 characters long")
    .isLength({ min: 6 })
    .run(req);
  await check("confirmPassword", "Passwords do not match")
    .equals(req.body.password)
    .run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash(
      "errors",
      errors.array().map((err: ValidationError) => err.msg)
    );
    return res.redirect("back");
  }
  async.waterfall(
    [
      function resetPassword(
        token: string,
        done: (err: any, user: UserDocument) => void
      ) {
        User.findOne({ passwordResetToken: token })
          .where("passwordResetExpires")
          .gt(Date.now())
          .exec()
          .then((user: UserDocument | null) => {
            if (!user) {
              req.flash(
                "errors",
                "Password reset token is invalid or has expired."
              );
              return res.redirect("back");
            }

            // Reset password logic here

            user
              .save()
              .then(() => {
                req.logIn(user, (err: any) => {
                  return done(err, user);
                });
                req.flash("success", "Password has been changed.");
                res.redirect("back");
              })
              .catch((err: any) => {
                return done(err, user);
              });
          });
      },

      function sendResetPasswordEmail(
        user: UserDocument,
        done: (err: any) => void
      ) {
        const transporter = nodemailer.createTransport({
          service: "SendGrid",
          auth: {
            user: process.env.SENDGRID_USER,
            pass: process.env.SENDGRID_PASSWORD,
          },
        });
        const mailOptions = {
          to: user.email,
          from: "nnheo@example.com",
          subject: "Your Hackathon Starter password has been changed",
          text:
            `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n` +
            `If you did not request this, please ignore this email and your password will remain unchanged.\n` +
            `Your password: ${user.password}` +
            "\n",
        };
        transporter.sendMail(mailOptions, (err: any, info: any) => {
          req.flash(
            "info",
            `An e-mail has been sent to ${user.email} with further instructions.`
          );
          done(err);
        });
      },
    ],
    (err: any) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    }
  );
};

/**
 * Forgot Password page.
 * @route GET /forgot
 */
export const getForgot = (req: Request, res: Response): void => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  res.render("account/forgot", {
    title: "Forgot Password",
  });
};

/**
 * Create a random token, then the send user an email with a reset link.
 * @route POST /forgot
 */
export const postForgot = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await check("password", "Password must be 6 characters long")
    .isLength({ min: 6 })
    .run(req);
  await body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .notEmpty();
  await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash(
      "errors",
      errors.array().map((err: ValidationError) => err.msg)
    );
    return res.redirect("/forgot");
  }
  async.waterfall(
    [
      function createRandomToken(done: (err: any, token: string) => void) {
        crypto.randomBytes(16, (err: any, buf) => {
          const token = buf.toString("hex");
          done(err, token);
        });
      },
      function setRandomToken(
        token: string,
        done: (
          err: NativeError | WriteError,
          token?: AuthToken,
          user?: UserDocument
        ) => void
      ) {
        User.findOne(
          { email: req.body.email },
          (err: any, user: UserDocument | undefined) => {
            if (err) {
              return done(err);
            }
            if (!user) {
              req.flash(
                "errors",
                "Account with that email address does not exist."
              );
              return res.redirect("/forgot");
            }
            user.passwordResetToken = token;
            user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
            user
              .save()
              .then(() => {
                done(err);
              })
              .catch(() => {
                done(err);
              });
          }
        );
      },
      function sendForgotPasswordEmail(
        token: string,
        done: (err: any) => void
      ) {
        const transporter = nodemailer.createTransport({
          service: "SendGrid",
          auth: {
            user: process.env.SENDGRID_USER,
            pass: process.env.SENDGRID_PASSWORD,
          },
        });
        const mailOptions = {
          to: req.body.email,
          from: "nnheo@example.com",
          subject: "Reset your password on Hackathon Starter",
          text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n`,
        };
        transporter.sendMail(mailOptions, (err: any, info: any) => {
          req.flash(
            "info",
            `An e-mail has been sent to ${req.body.email} with further instructions.`
          );
          done(err);
        });
      },
    ],
    (err: any) => {
      if (err) {
        return next(err);
      }
      res.redirect("/forgot");
    }
  );
};

/**
 * OAuth authentication routes. (Sign in)
 */
const signin = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err: any, user: Express.User, info: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json(info);
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json(user);
    });
    return next();
  })(req, res, next);
};

export async function list(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any, Record<string, any>>> {
  const users = await User.find({});
  if (users.length === 0) {
    return res.status(404).json({
      code: 404,
      success: false,
      message: "No users found",
    });
  }
  return res.status(200).json({
    code: 200,
    success: true,
    data: users,
  });
}



