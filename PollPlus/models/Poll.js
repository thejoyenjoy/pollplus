const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const optionSchema = new mongoose.Schema({
  optionLabel: String,
  votes: {
    type: Number,
    default: 0,
  },
});

const PollSchema = new mongoose.Schema({
  creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  creatorName: {type: String},
  label: {
    type: String,
    required: true,
  },
  hint: {type: String},
  options: [optionSchema],
  allowParticipantOptions: {type: Boolean, required: true},
  requireAuth: {type: Boolean, required: true},
  requirePassword: {type: Boolean, required: true},
  pollPassword: {
    type: String,
    minlength: [4, 'Password must be greater than 4'],
    required: function() {return this.requirePassword}
  },
  voted: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  created: {
    type: Date,
    default: Date.now,
  },
  user: [{type: mongoose.Schema.Types.ObjectId, ref: 'Poll'}],
});

PollSchema.pre('save', async function(next) {
  /**
   * This checks for the cost value after the version identifier 
   * and refines the character class for the salt and hash bits. 
   * Depending on your interpreter, you may not need to escape the / in the regex. 
   * For the cost value, this simply checks the format, not whether the value
   * is valid (valid values are 4-31, inclusive)
   * https://stackoverflow.com/questions/31417387/regular-expression-to-find-bcrypt-hash
   */
  const regexBcrypt = /^\$2[ayb]\$[0-9]{2}\$[A-Za-z0-9\.\/]{53}$/;

  if(!regexBcrypt.test(this.pollPassword) && this.pollPassword !== undefined){
    const rounds = 10;
    const hash = await bcrypt.hash(this.pollPassword, rounds);
    this.pollPassword = hash;
  }
  next();
});

PollSchema.statics.comparePassword = function(password, callback){
  bcrypt.compare(password, this.pollPassword, (err, isMatch) => {
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
};

module.exports = mongoose.model('Poll', PollSchema);
