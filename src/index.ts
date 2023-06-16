import express from 'express'
import compression from 'compression'
import session from 'express-session'
import dotenv from 'dotenv'
import lusca from 'lusca'
import flash from 'express-flash'
import path from 'path'
import mongoose from 'mongoose'
import passport from 'passport'
import bluebird from 'bluebird'
import { MONGODB_URI, SESSION_SECRET } from './util/secrets'
import MongoStore from 'connect-mongo'
import * as homeController from './controllers/home'
import * as userController from './controllers/user'
// import * as apiController from "./controllers/api";
import * as contactController from './controllers/contact'
import * as googleController from './controllers/google'
// import * as passportConfig from "./config/facebook.passport";
import * as googlePassport from './config/google.passport'
import { SessionOptions } from 'express-session'

import { Store } from 'express-session'

dotenv.config()

interface CustomSession extends session.Session {
  returnTo?: string
}

// Create Express server
const app = express()

mongoose.Promise = bluebird
const googleClientId = process.env.GOOGLE_CLIENT_ID as string
const mongoUrl = process.env.MONGODB_URI as string

const sessionOptions: SessionOptions = {
  secret: process.env.SESSION_SECRET || 'your-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongoUrl,
    client: mongoose.connection.getClient()
  }),
  cookie: { maxAge: 1209600000 }
}

app.use(session(sessionOptions))

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  } as mongoose.ConnectOptions)
  .then(() => {
    /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
  })
  .catch((err: Error) => {
    console.log(
      `MongoDB connection error. Please make sure MongoDB is running. ${err}`
    )
    // process.exit();
  })

// Express configuration...
express().set('trust proxy', true)
app.use(
  (
    req: express.Request<{}, {}, {}, CustomSession>,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (
      !req.user &&
      req.path !== '/login' &&
      req.path !== '/signup' &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)
    ) {
      req.session.returnTo = req.path
    } else if (req.user && req.path == '/account') {
      req.session.returnTo = req.path
    }
    next()
  }
)

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (
      !req.user &&
      req.path !== '/login' &&
      req.path !== '/signup' &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)
    ) {
      req.session.returnTo = req.path
    } else if (req.user && req.path == '/account') {
      req.session.returnTo = req.path
    }
    next()
  }
)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use(compression())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

app.use(lusca.xframe('SAMEORIGIN'))
app.use(lusca.xssProtection(true))

app.use((req, res, next) => {
  res.locals.user = req.user
  next()
})

app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, '../views'))
app.set('view engine', 'pug')
app.use(compression())

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }))

app.get('/', homeController.index)
app.get('/login', userController.getLogin)
app.post('/login', userController.postLogin)
app.get('/logout', userController.logout)
app.get('/forgot', userController.getForgot)
app.post('/forgot', userController.postForgot)
app.get('/reset/:token', userController.getReset)
app.post('/reset/:token', userController.postReset)
app.get('/signup', userController.getSignup)
app.post('/signup', userController.postSignup)
app.use('/', homeController.index)
app.use('/users', userController.list)
// app.use("/api", apiController.list);
// app.use("/contact", contactController.list);

declare module 'express-session' {
  interface SessionData {
    returnTo?: string
  }
}

app.use((req, res, next) => {
  const err: any = new Error('Not Found')
  err.statusCode = 404
  next(err)
})

// app.get("/api", apiController.getApi);
app.get(
  '/api/google',
  googlePassport.isAuthenticated,
  googlePassport.isAuthorized,
  googlePassport.getGoogle
)

app.get(
  '/auth/instagram',
  passport.authenticate('instagram', { scope: ['basic', 'public_content'] })
)

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleCallback
)

export function googleCallback (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const returnTo = req.session.returnTo as string // Type assertion

  res.redirect(returnTo || '/')
  req.session.returnTo = ''
  next()
}

app.use(
  (
    err: { message: any; status: any },
    req: { app: { get: (arg0: string) => string } },
    res: {
      locals: { message: any; error: any }
      status: (arg0: any) => void
      render: (arg0: string) => void
    },
    next: any
  ) => {
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}
    res.status(err.status || 500)
    res.render('error')
  }
)

app.get(
  '/api/google',
  googlePassport.isAuthenticated,
  googlePassport.isAuthorized,
  googlePassport.getGoogle
)

app.get(
  '/auth/facebook',
  passport.authenticate('facebook', { scope: ['email', 'public_profile'] })
)

app.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(req.session.returnTo || '/')
  }
)

export default app
