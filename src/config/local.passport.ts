import User,{  UserDocument } from "../models/User";
import { Express } from "express";
import moment from "moment";
import passport from "passport";
import { Strategy as LocalStrategy, IVerifyOptions } from "passport-local";
import refresh from "passport-oauth2-refresh";

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user: UserDocument | null = await User.findOne({
          email: email.toLowerCase(),
        }).exec();

        if (!user) {
          return done(null, false, {
            message: `Email ${email} not found.`,
          } as IVerifyOptions);
        }

        if (!user.password) {
          return done(null, false, {
            message:
              "Your account was registered using a sign-in provider. To enable password login, sign in using a provider, and then set a password under your user profile.",
          } as IVerifyOptions);
        }

        user.comparePassword(password, (err: any, isMatch: boolean) => {
          if (err) {
            return done(err);
          }
          if (isMatch) {
            return done(null, user);
          }
          return done(null, false, {
            message: "Invalid email or password.",
          } as IVerifyOptions);
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);
/**
 * Login Required middleware.
 */
export const isAuthenticated = (
  req: { isAuthenticated: () => any },
  res: { redirect: (arg0: string) => void },
  next: () => any
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

/**
 * Authorization Required middleware.
 */
export const isAuthorized = (
  req: { path: string; user: { tokens: any[] } },
  res: any,
  next: any
) => {
  const provider = req.path.split("/")[2];
  const token = req.user.tokens.find((token: { kind: any }) => {
    token.kind === provider;
  });
  if (token) {
    // Is there an access token expiration and access token expired
    if (
      token.accessTokenExpires &&
      moment(token.accessTokenExpires).isBefore(moment().subtract(1, "minutes"))
    ) {
      // Yes: Is there a refresh token?
      if (token.refreshToken) {
        //Yes: Does it have expiration and if so is it expired?
        if (
          token.refreshTokenExpires &&
          moment(token.refreshTokenExpires).isBefore(
            moment().subtract(1, "minutes")
          )
        ) {
          //       Yes,  We got nothing, redirect to res.redirect(`/auth/${provider}`);
          res.redirect(`/auth/${provider}`);
        } else {
          // No, refresh token and save, and then go to next();
          refresh.requestNewAccessToken(
            `${provider}`,
            token.refreshToken,
            (err, accessToken, refreshToken, params) => {
              User.findOne({ email: params.email }, (err: any, user: any) => {
                if (err) {
                  return next(err);
                }
                if (!user) {
                  // User not found, handle the error
                  return next(new Error("User not found"));
                }
                //    No:  Treat it like we got nothing, redirect to res.redirect(`/auth/${provider}`);

                user.tokens.some(
                  (tokenObject: {
                    kind: string;
                    accessToken: string;
                    accessTokenExpires: string;
                  }) => {
                    // No: we are good, go to next():
                    if (tokenObject.kind === provider) {
                      tokenObject.accessToken = accessToken;
                      if (params.expires_in)
                        tokenObject.accessTokenExpires = moment()
                          .add(params.expires_in, "seconds")
                          .format();
                      return true;
                    }

                    return false;
                  }
                );
                req.user = user;
                user.markModified("tokens");
                user.save((err: any) => {
                  if (err) console.log(err);
                  next();
                });
              });
            }
          ); 
        }
      } else {
        res.redirect(`/auth/${provider}`);
      }
    } else {
      next();
    }
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
