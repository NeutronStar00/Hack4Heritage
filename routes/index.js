const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../routes/users');
const GoogleStrategy = require('passport-google-oidc');
require('dotenv').config();
const uploadToDrive = require('./drive');

// google strategy code for passport js
passport.use(new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  callbackURL: '/oauth2/redirect/google',
  scope: [ 'profile' , 'email' ]
}, async function verify(issuer, profile, cb) {
  // console.log(profile)
   let user = await users.findOne({email: profile.emails[0].value});
   if(user){ // user mil jye to login
     return cb(null, user);
   } 
   // agr nhi mila to create krdo
   let newUser = await users.create({
    name: profile.displayName,
    email: profile.emails[0].value,
   });
   await newUser.save();
   return cb(null,newUser)
}));

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.user){
    return res.redirect('/login');
  }
  return res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/login/federated/google', router.get('/login/federated/google', passport.authenticate('google')));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

router.post('/upload',uploadToDrive, function(req, res) {
  // This code will be executed after the file is uploaded to Google Drive
  res.send('File uploaded successfully!');
});

module.exports = router;
