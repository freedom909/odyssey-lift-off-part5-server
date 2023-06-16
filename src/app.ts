import express from 'express';
import compression from 'compression'
import session from 'express-session';
import logger from 'morgan'
import errorHandler from 'errorhandler';
import path from 'path';  

import dotenv from 'dotenv';
import MongoStore from 'connect-mongo';
import flash from 'express-flash';

const upload= express.static(path.join(__dirname, 'uploads'))
dotenv.config({path:'env'})
/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
import * as homeController from './controllers/home';
import * as userController from './controllers/user';
// import * as apiController from './controllers/api';
import * as contactController from './controllers/contact';
import mongoose from 'mongoose';
import { cookie } from 'express-validator';
import passport from 'passport';
import lusca from 'lusca';
import { passportConfig } from 'config/index.config';

const app = express();
mongoose.connect(process.env.MONGODB_URI||'')
mongoose.connection.on('error', (err) => {
    console.error(err);
    console.log('%s MongoDB connection error. Please make sure MongoDB is running.');
    process.exit();
  });

  /**
 * Express configuration.
 */
  app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
  app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
  app.set('view engine', 'pug');
  app.set('view',path.join(__dirname,'views'))
  app.use(express.static(path.join(__dirname,'upload.html')));
  app.use(logger('dev'))
  app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET ||'',
    cookie: { maxAge: 1209600000 }, // Two weeks in milliseconds
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI })
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  app.use((req, res, next) => {
    if (req.path==='/api/upload') {
        next();
    }else {
        lusca.csrf()(req, res, next);
    }
    });
    app.use(lusca.xframe('SAMEORIGIN'));
    app.use(lusca.xssProtection(true));
    app.disable('x-powered-by');
    app.use((req, res, next) => {
        res.locals.user = req.user;
        next();
      });
      app.use((req, res, next) => {
        // After successful login, redirect back to the intended page
        if (!req.user
          && req.path !== '/login'
          && req.path !== '/signup'
          && !req.path.match(/^\/auth/)
          && !req.path.match(/\./)) {
          req.session.returnTo = req.originalUrl;
        } else if (req.user
          && (req.path === '/account' || req.path.match(/^\/api/))) {
          req.session.returnTo = req.originalUrl;
        }
        next();
      });
      app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
      app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/chart.js/dist'), { maxAge: 31557600000 }));
      app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), { maxAge: 31557600000 }));
      app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), { maxAge: 31557600000 }));
      app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/jquery/dist'), { maxAge: 31557600000 }));
      app.use('/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }));

     
      app.get('/', homeController.index);
      app.get('/login', userController.getLogin);
/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
// app.get('/account/verify', passportConfig.isAuthenticated, userController.getVerifyEmail);
//  app.get('/account/verify/:token', passportConfig.isAuthenticated, userController.getVerifyEmailToken);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);