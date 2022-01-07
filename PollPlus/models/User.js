const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    min: 2,
    max: 15,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['user', 'unauthenticated', 'admin'],
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  polls: [{type: mongoose.Schema.Types.ObjectId, ref: 'Poll'}],
  savedPolls: [{type: mongoose.Schema.Types.ObjectId, ref: 'Poll'}],
});

UserSchema.pre('save', function(next){
  if(!this.isModified('password')){
    return next();
  }
  bcrypt.hash(this.password, 10, (err, passwordHash) =>{
    if (err) {
      return next(err);
    }
    this.password = passwordHash;
    next();
  });
});

UserSchema.methods.comparePassword = function(password, callback){
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if(err){
      return callback(err);
    } else {
      //check if password does not match with password from db
      if (!isMatch) {
        return callback(null, isMatch)
      }
      //attach user object to request object if password is correct
      return callback(null, this);
    }
  });
}

module.exports = mongoose.model('User', UserSchema);
