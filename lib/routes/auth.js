import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';
import express from 'express';

const router = express.Router();

passport.use(new OAuth2Strategy({
    authorizationURL: 'https://chaand.getkwikid.com/oauth/v2/authorize',
    tokenURL: 'https://chaand.getkwikid.com/oauth/v2/token',
    clientID: '189220571408564229@kwikid',
    clientSecret: 'A05opdj3zRSuNFBs3lfHdKChHzCRsNLOHSscFt26alODKCFZE5I8GkoEWADkbwhS',
    callbackURL: "http://localhost:8081/oauth/callback",
    scope: 'openid email profile',
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);
    console.log(cb);
    console.log(cb());
  }
));

router.get('/login', passport.authenticate('oauth2'));
router.get('/oauth/callback', 
  passport.authenticate('oauth2', { failureRedirect: '/login'}), 
  function(req, res) {
    console.log("Herer is the code");
    res.redirect('/');
  }
)

export default router;
