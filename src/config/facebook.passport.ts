import { Express } from "express";
import { Strategy as FacebookStrategy } from "passport-facebook";
import passport from "passport";
import User  from "../models/User";
import dotenv from "dotenv";
dotenv.config();
import qs, { ParsedQs } from "qs";

import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";

import fetch from "node-fetch";

export function configurePassport(app: Express) {
  // Initialize passport
  app.use(passport.initialize());

  // Configure passport middleware and strategies

  const facebookClientId = process.env.FACEBOOK_CLIENT_ID as string;
  const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET as string;

  const facebookStrategy = new FacebookStrategy(
    {
      clientID: facebookClientId,
      clientSecret: facebookClientSecret,
      callbackURL: "http://localhost:3000/auth/facebook/callback",
      profileFields: ["id", "displayName", "photos", "email"],
      passReqToCallback: true,
    },
    (
      req,
      accessToken,
      refreshToken,
      profile,
      done
    ) => {
      if (req.user) {
        User.findOne({ facebook: profile.id }, (err: any, user: any) => {
          if (err) {
            return done(err);
          }
          if (user) {
            req.flash("info", "You are already logged in.");
          } else {
            User.findById(profile.id, (err: any, user: { facebook: string; tokens: { kind: string; accessToken: string; }[]; profile: { name: string; gender: string | undefined; picture: string; }; save: (arg0: (err: any, user: any) => void) => void; }) => {
              if (err) {
                return done(err);
              }
             
              const photo = profile.photos?.[0]?.value ?? "";
              user.facebook = profile.id;
              user.tokens.push({ kind: "facebook", accessToken });
              user.profile.name = user.profile.name || profile.displayName;
              user.profile.gender = user.profile.gender || profile.gender;
              user.profile.picture = user.profile.picture || photo;
              user.save((err: any, user: any) => {
                if (err) {
                  return done(err);
                }
                req.flash("info", "You are now logged in.");
                return done(null, user);
              });
            });
          }
        });
      } else {
        User.findOne({ facebook: profile.id }, (err: any, user: any) => {
          if (err) {
            return done(err);
          }
          if (user) {
            done(null, user);
          } else {
            User.findOne({ email: profile._json.email }, (err: any, user: any) => {
              if (err) {
                return done(err);
              }
              if (user) {
                req.flash("info", "You are already logged in.");
                done(null, user);
              } else {
                const newUser = new User();
                newUser.email = profile._json.email;
                newUser.tokens.push({ kind: "facebook", accessToken });
                newUser.profile.name = profile.displayName;
                newUser.profile.gender = profile._json.gender;
                newUser.profile.picture = profile._json.picture;
                newUser.save()
                .then((user: any) => {
                  req.flash("info", "You are now logged in.");
                  return done(null, user);
                })
                .catch((err: any) => {
                  return done(err);
                });              
              }
            });
          }
        });
      }
    }
  );

  passport.use(facebookStrategy);
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((id, done) => {
    User.findById(id, (err: any, user: boolean | Express.User | null | undefined) => {
      done(err, user);
    });
  });
}


export function authorizeFacebook(
  req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>> &
    Express.AuthenticatedRequest,
  res: Response<any, Record<string, any>>,
  next: NextFunction,
 
) {
  // Check if the user is authenticated and authorized
  if (req.isAuthenticated() && req.user) {
    // Perform additional authorization checks if needed

    // Exchange authorization code for access token
    if (req.query.code) {
      const code = req.query.code as string;
      
      const clientId = process.env.FACEBOOK_CLIENT_ID;
      const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
      const redirectUri = process.env.FACEBOOK_REDIRECT_URI;
      const tokenUrl = "https://graph.facebook.com/v13.0/oauth/access_token";

      const params = {
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code,
      };

      const tokenOptions = {
        method: "GET",
      };

      fetch(`${tokenUrl}?${qs.stringify(params)}`, tokenOptions)
      .then((response) => response.json())
      .then((data) => {
        const typedData: { access_token: string; expires_in: number } = data as {
          access_token: string;
          expires_in: number;
        };
        const accessToken = typedData.access_token;
        const expiresIn = typedData.expires_in;
        // Use the access token for further API calls or store it for future use
        // You can also handle refreshing the access token if needed
        next();
      })
      .catch((error) => {
        // Handle the error
        next(error);
      });
    
    
    } else {
      // Handle the case when there is no authorization code
      next(new Error("Authorization code not found."));
    }
  } else {
    // Handle unauthorized access
    res.redirect("/login");
  }
}
