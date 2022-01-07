const passport = require('passport');
const LocalStrategy = require('passport-local');
const JwtStrategy = require('passport-jwt').Strategy;
const User = require('./models/User');

require('dotenv').config();
const SECRET_OR_KEY = process.env.SECRET_OR_KEY;

const cookieExtractor = req => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["access_token"];
  }
  return token;
}

// authorization for protecting endpoints
passport.use(new JwtStrategy({
  jwtFromRequest: cookieExtractor,
  secretOrKey: SECRET_OR_KEY,
}, (payload, done) => {
  User.findById({_id: payload.sub}, (err, user) => {
    if (err) {
      return done(err, false);
    }
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
}));

//authorization local strategy using username and password
passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({username},(err, user)=>{
    if(err)
      return done(err);
    if(!user)
      return done(null, false);
    user.comparePassword(password, done);
  });
}));
