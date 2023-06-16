import {
  Strategy as GoogleStrategy,
  StrategyOptions,
  StrategyOptionsWithRequest,
} from "passport-google-oauth20";

import User, { UserDocument } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { Strategy, IVerifyOptions} from "passport-local";
import { ParsedQs } from "qs";
import passport, { session } from "passport";
import { Express, RequestHandler } from "express";
import { profile } from "winston";
import qs from "qs";
import { SessionOptions } from "express-session";
// import { SessionOptions } from "express-session";
import express from "express";
import refresh from 'passport-oauth2-refresh';
import { SessionOptions as PassportSessionOptions } from "passport";
import dotenv from "dotenv";
dotenv.config();
import authorizeWithProvider from './authorizeWithProvider'; 
import errorHandler from "errorhandler";
const app = express();
// Initialize passport
app.use(passport.initialize());


export function configurePassport(app: Express) {
  // Initialize passport
  app.use(passport.initialize());
 
  // Configure passport middleware and strategies

  const googleClientId = process.env.GOOGLE_CLIENT_ID as string;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET as string;

  const googleStrategyOptions: StrategyOptionsWithRequest = {
    passReqToCallback: true,
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: "/auth/google/callback",
  };

  const googleStrategy=new GoogleStrategy(
    googleStrategyOptions,
    async (
      req: any,
      _accessToken: string,
      _refreshToken: string,
      _params: any,
      profile: any,
      done: any
    ) => {
      // Your authentication logic here
      if (req.user) {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }
      }
      // Find or create a user based on the profile information
      const email =
        profile.emails && profile.emails.length > 0
          ? profile.emails[0].value
          : "";
      const user = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email: email,
        picture: profile.photos && profile.photos.length > 0? profile.photos[0].value : "",
        
      });
      

      // Call done() with the user object
      done(null, user);
    }
  )
  passport.use('google',googleStrategy);
  refresh.use('google', googleStrategy);
  app.use(passport.session());
}


// Configure passport session
const sessionsecret = process.env.SESSION_SECRET as string;

export function configurePassportSession(app: Express) {
  const sessionOptions: PassportSessionOptions & SessionOptions = {
    secret: sessionsecret,
    resave: false,
    saveUninitialized: false,
    pauseStream: false,
  };

  app.use(session(sessionOptions));
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err: any, user: UserDocument | null) => {
    done(err, user);
  });
});

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/login");
}

export function isAuthorized(req: Request, res: Response, next: NextFunction) {
  // Check if the user is authenticated and authorized

  if (req.isAuthenticated() && req.user) {
    // Perform additional authorization checks if needed

    // ...
    return next();
  }
  return res.redirect("/login");
}

export function getGoogle(req: Request, res: Response, next: NextFunction) {
  // Check if the user is authenticated and authorized
  if (req.isAuthenticated() && req.user) {
    // Perform additional authorization checks for accessing Google resources
    // Call the authorizeWithProvider function
    authorizeWithProvider(req, res, next,googleSignIn);
    // ...
    return next();
  }
  return res.redirect("/login");
}

/**
 * Sign in with Google.
 */
export function googleSignIn(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
}

/**
 * Sign out.
 */
export function signOut(req: Request, res: Response, _next: RequestHandler) {
  req.logout(() => {
    res.redirect("/");
  });
  res.json({ message: "Successfully signed out." });
}

/**
 * OAuth callback.
 */
export function oauthCallback(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("google", { failureRedirect: "/login" })(
    req,
    res,
    next
  );
}
/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err: Error, req: Request, res:Response) => {
    console.error(err);
    res.status(500).send(err.message)

  });
}