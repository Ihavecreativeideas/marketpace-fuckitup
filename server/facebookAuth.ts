import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import type { Express } from 'express';

interface FacebookProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string }>;
  photos: Array<{ value: string }>;
}

export function setupFacebookAuth(app: Express) {
  // Only set up Facebook authentication if credentials are provided
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    console.log('Facebook credentials not found - Facebook authentication disabled');
    return;
  }

  // Facebook Strategy Configuration
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID!,
    clientSecret: process.env.FACEBOOK_APP_SECRET!,
    callbackURL: "/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails', 'photos']
  }, async (accessToken: string, refreshToken: string, profile: FacebookProfile, done: any) => {
    try {
      // Here you would typically save/update user in database
      const user = {
        facebookId: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
        photo: profile.photos?.[0]?.value,
        accessToken,
        refreshToken
      };
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // Serialize/deserialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  // Privacy-compliant Facebook OAuth (redirect-based, not embedded)
  app.get('/auth/facebook', (req, res) => {
    // Store return URL for post-authentication redirect
    const returnUrl = req.query.returnUrl || '/';
    req.session.returnUrl = returnUrl;
    
    // Use redirect-based OAuth instead of embedded iframe
    passport.authenticate('facebook', { 
      scope: ['email', 'public_profile', 'pages_manage_metadata', 'pages_read_engagement'],
      // Force redirect to facebook.com then back to MarketPace
      display: 'popup',
      auth_type: 'rerequest'
    })(req, res);
  });

  app.get('/auth/facebook/callback', 
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    (req, res) => {
      // Successful authentication - redirect to stored return URL
      const returnUrl = req.session.returnUrl || '/';
      delete req.session.returnUrl;
      res.redirect(returnUrl);
    }
  );

  // Facebook logout
  app.get('/auth/facebook/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.redirect('/');
    });
  });
}