import { Strategy as FacebookStrategy } from "passport-facebook";
import passport from "passport";
import  User  from "../models/User";
import dotenv from "dotenv";
dotenv.config();
import qs, { ParsedQs } from "qs";

import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";

import fetch from "node-fetch";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface AuthInfo {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  scope: string; // Add this line
}

  
const authorizeWithProvider = (
  req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>> & Express.AuthenticatedRequest,
  res: Response<any, Record<string, any>>,
  next: NextFunction,
  optionTypes: Record<string, any>
) => {
  // Perform the necessary checks for user authentication and authorization.
  if (!optionTypes[optionTypes.provider]) {
    return next(new Error("Invalid provider specified"));
  }
  if (!optionTypes[optionTypes.provider].callbackURL) {
    return next(new Error("Invalid callback URL specified"));
  }

  if (!req.query.code) {
    // If the authorization code is not present in the request, redirect the user to the authorization page.
    return res.redirect(optionTypes[optionTypes.provider].callbackURL);
  }

  if (!req.authInfo) {
    return next(new Error("No authorization information found"));
  }

  // Construct the token request parameters.
  const tokenRequestParams = {
    code: req.query.code,
    redirect_uri: optionTypes[optionTypes.provider].callbackURL,
    client_id: optionTypes[optionTypes.provider].clientID,
    client_secret: optionTypes[optionTypes.provider].clientSecret,
    grant_type: "authorization_code",
  };

  let tokenURL = "";

  // Determine the appropriate URL based on the provider
  switch (optionTypes.provider) {
    case "facebook":
      tokenURL = process.env.FACEBOOK_TOKEN_URL as string;
      break;
    case "google":
      tokenURL = process.env.GOOGLE_TOKEN_URL as string;
      break;
    // Add cases for other providers if needed
    default:
      return next(new Error("Invalid provider specified"));
  }

  return fetch(tokenURL, {
    method: "POST",
    body: qs.stringify(tokenRequestParams),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((response) => response.json())
    .then((responseJson) => {
        const tokenResponse = responseJson as TokenResponse;
      
        if (req.authInfo) {
          const authInfo = req.authInfo as AuthInfo;
          authInfo.accessToken = tokenResponse.access_token;
          authInfo.refreshToken = tokenResponse.refresh_token;
          authInfo.expiresIn = tokenResponse.expires_in;
          authInfo.tokenType = tokenResponse.token_type;
          authInfo.scope = tokenResponse.scope;
        } else {
          return next(new Error("No authorization information found"));
        }
      
        return next();
      })
      
      
    .catch((error) => {
      return next(error);
    });
};

export default authorizeWithProvider;
