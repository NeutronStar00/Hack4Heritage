const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../routes/users');
const GoogleStrategy = require('passport-google-oidc');
require('dotenv').config();
const uploadToDrive = require('./drive');
const bodyParser = require('body-parser');
const cors = require('cors');
const runGeminiAI = require('../Heritage/geminiLocation'); // Import the function from geminiLocation.js
router.use(bodyParser.json());

router.use(express.json());
router.use(cors());


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
  // if(!req.user){
  //   return res.redirect('/login');
  // }
  return res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/map', function(req, res, next) {
  res.render('home');
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


router.get('/geoLocation', (req, res) => {
  res.render('geoLocation');
});

router.post('/heritage', (req, res) => {
  const { latitude, longitude } = req.body;
  console.log("Received location: Latitude - ${ latitude }, Longitude - ${ longitude }");

  // Trigger the geminiLocation function
  runGeminiAI(latitude, longitude)
    .then(heritageSites => {
      res.json({ status: 'success', message: 'Heritage sites retrieved', ...heritageSites });
    })
    .catch(error => {
      console.error("Error fetching heritage sites:", error);
      res.status(500).json({ status: 'error', message: 'Failed to retrieve heritage sites', error: error.message });
    });
});


module.exports = router;
