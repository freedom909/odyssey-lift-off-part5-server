import passport from 'passport';
import express, { Request, Response } from 'express';
import * as googlePassport from '../config/google.passport';
const app = express();

// Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());
// Route for initiating the Google authentication
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleCallback
);

function googleCallback(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const returnTo = req.session.returnTo as string; // Type assertion

  res.redirect(returnTo || "/");
  req.session.returnTo = '';
  next();
}

// Callback route for Google authentication
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  // Redirect or handle the successful authentication
  res.redirect('/dashboard');
});

/**
 * Login page.
 * @route GET /login
 */

app.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login'
  });
});

/**
 * Logout page.
 * @route GET /logout
 */

app.get('/logout', (req, res) => {
  req.logout(()=> { res.redirect('/')});
  res.redirect('/');
});

/**
 * Register page.
 * @route GET /register
 */

app.get('/register', (req, res) => {
  res.render('register', {
    title: 'Register'
  });
});

/**
 * Dashboard page.
 * @route GET /dashboard
 */

app.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard'
  });
});

/**
 * Profile page.
 * @route GET /profile
 */

app.get('/profile', (req, res) => {
  res.render('profile', {
    title: 'Profile'
  });
});

/**
 * Password page.
 * @route GET /password
 */

app.get('/password', (req, res) => {
  res.render('password', {
    title: 'Password'
  });
});

/**
 * Password reset page.
 * @route GET /password/reset
 */

app.get('/password/reset', (req, res) => {
  res.render('password/reset', {
    title: 'Password Reset'
  });
});

app.get('/photos', googlePassport.getGoogle, (req, res) => {
  // Handle the request to fetch photos
  // ...
});

app.get('/download', googlePassport.getGoogle, (req, res) => {
  // Handle the request to fetch photos
  // ...
});

export default app;
