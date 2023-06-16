// import graph from "fbgraph";
// import { Response, Request, NextFunction, request } from "express";
// import { UserDocument } from "../models/User";
// import { reject } from "async";
// import { resolve } from "bluebird";

// import { promisify } from 'util';
// import cheerio from 'cheerio';
// import { LastFmNode } from 'lastfm';
// import tumblr from 'tumblr.js';
// import { Octokit } from '@octokit/rest';
// import Twitter from 'twitter-lite';

// import paypal from 'paypal-rest-sdk';
// import crypto from 'crypto';

// import axios from 'axios';
// import { google } from 'googleapis';

// import validator from 'validator';



// /**
//  * GET /api
//  * List of API examples.
//  */
// export const getApi = (req, res) => {
//   res.render('api/index', {
//     title: 'API Examples'
//   });
// };

// /**
//  * GET /api/foursquare
//  * Foursquare API example.
//  */




// /**
//  * GET /api/facebook
//  * Facebook API example.
//  */
// export const getFacebook = (req, res, next) => {
//   const token = req.user.tokens.find((token) => token.kind === 'facebook');
//   const secret = process.env.FACEBOOK_SECRET;
//   const appsecretProof = crypto.createHmac('sha256', secret).update(token.accessToken).digest('hex');
//   axios.get(`https://graph.facebook.com/${req.user.facebook}?fields=id,name,email,first_name,last_name,gender,link,locale,timezone&access_token=${token.accessToken}&appsecret_proof=${appsecretProof}`)
//     .then((response) => {
//       res.render('api/facebook', {
//         title: 'Facebook API',
//         profile: response.data
//       });
//     })
//     .catch((error) => next(error.response));
// };


// /**
//  * GET /api/twitter
//  * Twitter API example.
//  */
// export const getTwitter = async (req, res, next) => {
//   const token = req.user.tokens.find((token) => token.kind === 'twitter');
//   const T = new Twitter({
//     consumer_key: process.env.TWITTER_KEY,
//     consumer_secret: process.env.TWITTER_SECRET,
//     access_token_key: token.accessToken,
//     access_token_secret: token.tokenSecret
//   });
//   try {
//     const { statuses: tweets } = await T.get('search/tweets', {
//       q: 'nodejs since:2013-01-01',
//       geocode: '40.71448,-74.00598,5mi',
//       count: 10
//     });
//     res.render('api/twitter', {
//       title: 'Twitter API',
//       tweets
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * POST /api/twitter
//  * Post a tweet.
//  */
// export const postTwitter = async (req, res, next) => {
//   const validationErrors = [];
//   if (validator.isEmpty(req.body.tweet)) validationErrors.push({ msg: 'Tweet cannot be empty' });

//   if (validationErrors.length) {
//     req.flash('errors', validationErrors);
//     return res.redirect('/api/twitter');
//   }

//   const token = req.user.tokens.find((token) => token.kind === 'twitter');
//   const T = new Twitter({
//     consumer_key: process.env.TWITTER_KEY,
//     consumer_secret: process.env.TWITTER_SECRET,
//     access_token_key: token.accessToken,
//     access_token_secret: token.tokenSecret
//   });
//   try {
//     await T.post('statuses/update', { status: req.body.tweet });
//     req.flash('success', { msg: 'Your tweet has been posted.' });
//     res.redirect('/api/twitter');
//   } catch (error) {
//     next(error);
//   }
// };











// /**
//  * GET /api/chart
//  * Chart example.
//  */
// export const getChart = async (req, res, next) => {
//   const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSFT&outputsize=compact&apikey=${process.env.ALPHA_VANTAGE_KEY}`;
//   axios.get(url)
//     .then((response) => {
//       const arr = response.data['Time Series (Daily)'];
//       let dates = [];
//       let closing = []; // stock closing value
//       const keys = Object.getOwnPropertyNames(arr);
//       for (let i = 0; i < 100; i++) {
//         dates.push(keys[i]);
//         closing.push(arr[keys[i]]['4. close']);
//       }
//       // reverse so dates appear from left to right
//       dates.reverse();
//       closing.reverse();
//       dates = JSON.stringify(dates);
//       closing = JSON.stringify(closing);
//       res.render('api/chart', {
//         title: 'Chart',
//         dates,
//         closing
//       });
//     }).catch((err) => {
//       next(err);
//     });
// };



// /**
//  * GET /api/paypal
//  * PayPal SDK example.
//  */
// export const getPayPal = (req, res, next) => {
//   paypal.configure({
//     mode: 'sandbox',
//     client_id: process.env.PAYPAL_ID,
//     client_secret: process.env.PAYPAL_SECRET
//   });

//   const paymentDetails = {
//     intent: 'sale',
//     payer: {
//       payment_method: 'paypal'
//     },
//     redirect_urls: {
//       return_url: process.env.PAYPAL_RETURN_URL,
//       cancel_url: process.env.PAYPAL_CANCEL_URL
//     },
//     transactions: [{
//       description: 'Hackathon Starter',
//       amount: {
//         currency: 'USD',
//         total: '1.99'
//       }
//     }]
//   };

//   paypal.payment.create(paymentDetails, (err, payment) => {
//     if (err) { return next(err); }
//     const { links, id } = payment;
//     req.session.paymentId = id;
//     for (let i = 0; i < links.length; i++) {
//       if (links[i].rel === 'approval_url') {
//         res.render('api/paypal', {
//           approvalUrl: links[i].href
//         });
//       }
//     }
//   });
// };

// /**
//  * GET /api/paypal/success
//  * PayPal SDK example.
//  */
// export const getPayPalSuccess = (req, res) => {
//   const { paymentId } = req.session;
//   const paymentDetails = { payer_id: req.query.PayerID };
//   paypal.payment.execute(paymentId, paymentDetails, (err) => {
//     res.render('api/paypal', {
//       result: true,
//       success: !err
//     });
//   });
// };

// /**
//  * GET /api/paypal/cancel
//  * PayPal SDK example.
//  */
// export const getPayPalCancel = (req, res) => {
//   req.session.paymentId = null;
//   res.render('api/paypal', {
//     result: true,
//     canceled: true
//   });
// };




// export const getHereMaps = (req, res) => {
//   const imageMapURL = `https://image.maps.api.here.com/mia/1.6/mapview?\
// app_id=${process.env.HERE_APP_ID}&app_code=${process.env.HERE_APP_CODE}&\
// poix0=47.6516216,-122.3498897;white;black;15;Fremont Troll&\
// poix1=47.6123335,-122.3314332;white;black;15;Seattle Art Museum&\
// poix2=47.6162956,-122.3555097;white;black;15;Olympic Sculpture Park&\
// poix3=47.6205099,-122.3514661;white;black;15;Space Needle&\
// c=47.6176371,-122.3344637&\
// u=1500&\
// vt=1&&z=13&\
// h=500&w=800&`;

//   res.render('api/here-maps', {
//     app_id: process.env.HERE_APP_ID,
//     app_code: process.env.HERE_APP_CODE,
//     title: 'Here Maps API',
//     imageMapURL
//   });
// };

// export const getGoogleMaps = (req, res) => {
//   res.render('api/google-maps', {
//     title: 'Google Maps API',
//     google_map_api_key: process.env.GOOGLE_MAP_API_KEY
//   });
// };

// export const getGoogleDrive = (req, res) => {
//   const token = req.user.tokens.find((token) => token.kind === 'google');
//   const authObj = new google.auth.OAuth2({
//     access_type: 'offline'
//   });
//   authObj.setCredentials({
//     access_token: token.accessToken
//   });

//   const drive = google.drive({
//     version: 'v3',
//     auth: authObj
//   });

//   drive.files.list({
//     fields: 'files(iconLink, webViewLink, name)'
//   }, (err: any, response: { data: { files: any; }; }) => {
//     if (err) return console.log(`The API returned an error: ${err}`);
//     res.render('api/google-drive', {
//       title: 'Google Drive API',
//       files: response.data.files,
//     });
//   });
// };

// export const getGoogleSheets = (req, res) => {
//   const token = req.user.tokens.find((token: { kind: string; }) => token.kind === 'google');
//   const authObj = new google.auth.OAuth2({
//     access_type: 'offline'
//   });
//   authObj.setCredentials({
//     access_token: token.accessToken
//   });

//   const sheets = google.sheets({
//     version: 'v4',
//     auth: authObj
//   });

//   const url = 'https://docs.google.com/spreadsheets/d/12gm6fRAp0bC8TB2vh7sSPT3V75Ug99JaA9L0PqiWS2s/edit#gid=0';
//   const re = /spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
//   const id = url.match(re)[1];

//   sheets.spreadsheets.values.get({
//     spreadsheetId: id,
//     range: 'Class Data!A1:F',
//   }, (err, response) => {
//     if (err) return console.log(`The API returned an error: ${err}`);
//     res.render('api/google-sheets', {
//       title: 'Google Sheets API',
//       values: response.data.values,
//     });
//   });
// };

