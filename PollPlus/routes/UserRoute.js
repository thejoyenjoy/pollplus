const express = require('express');
const userRouter = express.Router();
const passport = require('passport');
// do not deletepassportConfiq! It is used
const passportConfiq = require('../passport');
const JWT = require('jsonwebtoken');
const User = require('../models/User');
const Poll = require('../models/Poll');

require('dotenv').config();
const SECRET_OR_KEY = process.env.SECRET_OR_KEY;

const signToken = userID =>{
  return JWT.sign({
    iss : SECRET_OR_KEY,
    sub : userID
  }, SECRET_OR_KEY, {expiresIn : "1h"});
}

userRouter.post('/register', (req, res) => {
  const { username, password, email, role } = req.body;
  User.findOne({username}, (err, user) => {
    if (err) {
      res.status(500).json({message: {msgBody: "Error has occurred", msgError: true}});
    }
    if(user){
      res.status(400).json({message: {msgBody: "Username already taken", msgError: true}});
    } else{
      const newUser = new User({username, password, email, role});
      newUser.save(err => {
        if (err) {
          res.status(500).json({message: {msgBody: "Error has occurred", msgError: true}});
        } else {
          res.status(201).json({message: {msgBody: "New user has been created", msgError: false}});
        }
      });
    }
  }); 
});

userRouter.post('/login', passport.authenticate('local', {session: false}), (req, res) => {
  if (req.isAuthenticated()) {
    const {_id, username, role} = req.user;
    const token = signToken(_id);
    res.cookie('access_token', token, {httpOnly: true, sameSite: true});
    res.status(200).json({isAuthenticated: true, user: {username, role, _id }});
  }
});

userRouter.get('/logout', passport.authenticate('jwt', {session : false}), (req,res) => {
  res.clearCookie('access_token');
  res.json({user: {username: "", role: ""}, success: true});
});


userRouter.post('/poll', passport.authenticate('jwt', {session: false}), (req, res) => {
  const poll = new Poll(req.body);
  poll.save(err => {
    if(err) {
      res.status(500).json({message: {msgBody: "Error has occurred", msgError: true}});
    } else {
        req.user.polls.push(poll);
        req.user.save(err => {
            if(err){
              res.status(500).json({message : {msgBody : "Error has occurred", msgError: true}});
            } else {
              res.status(200).json({message : {msgBody : "Successfully created poll", msgError : false}, id: poll._id});
            }
        });
    }
  })
});


userRouter.get('/polls', passport.authenticate('jwt', {session: false}), (req, res ) => {
  User.findById({_id : req.user._id}).populate('polls').exec((err, document) => {
    if (err) {
      res.status(500).json({message: {msgBody : "Error has occurred", msgError: true}});
    } else {
      res.status(200).json({polls: document.polls, authenticated : true});
    }
  });
});


userRouter.get('/poll/:id', passport.authenticate('jwt', {session: false}), async (req, res ) => {
  try {
    const urlID = req.params.id;
    const userID = req.user.id;
    const poll = await Poll.findById(urlID);
    const pollCreatorString = poll.creator.toString();
    (pollCreatorString === userID)
      ? res.status(200).json({poll: poll, authenticated : true })
      : res.status(401).json({message: {msgBody: "You're not the creator of this poll!", msgError: true}});
  } catch (error) {
    res.status(404).send('There is no poll with the ID of: ' + req.params.id);
  }
});


userRouter.patch('/poll/:id', passport.authenticate('jwt', {session: false}), async (req, res ) => {
  try {
    const urlID = req.params.id;
    const userID = req.user.id;
    const poll = await Poll.findById(urlID);
    const pollCreatorString = poll.creator.toString();
    const isCreator = (pollCreatorString === userID) ? true : false;
    
    if (isCreator) {
      const body = req.body;
      if(body.voteID){

        throw("You cannot vote as the creator of the poll!");
      }
      if(body.label){
        poll.label = body.label;
      }
      if(body.hint){
        poll.hint = body.hint;
      }
      if(body.pollPassword && poll.requirePassword === true){
        //pw.length >= 4 handled in server minlength
        poll.pollPassword = body.pollPassword;
      }
      if(body.newOption){
        let optionsArray = [];
        poll.options.map(item => {
          optionsArray.push({label: item.optionLabel});
          return null;
        });
        const newOptionString = body.newOption.toString();
        const isNewOptionInOption = optionsArray.filter(function(e) { return e.label === newOptionString; }).length > 0;
        if (isNewOptionInOption) {
          throw('The given new option is already an option!')
        } else {
          const newOption = {optionLabel: body.newOption};
          poll.options.push(newOption);
        }
      }
    } else {
      const body = req.body;
      if(body.voteID){
        const hasVoted = (poll.voted.indexOf(userID) > -1) ? true : false;
        if (hasVoted) {
          throw("You already voted!");
        } else {
          const objIndex = poll.options.findIndex((obj => obj._id == req.body.voteID));
          poll.options[objIndex].votes++;
          poll.voted.push(userID);
        }
      }
      if(body.newOption){
        if(poll.allowParticipantOptions === true){
          const newOptionString = body.newOption.toString();
          if (newOptionString === "") {
            throw('The new Option cannot be empty!')
          } else {
            let optionsArray = [];
            poll.options.map(item => {
              optionsArray.push({label: item.optionLabel});
              return null;
            });
            const isNewOptionInOption = optionsArray.filter(function(e) { return e.label === newOptionString; }).length > 0;
            if (isNewOptionInOption) {
              throw('The given new option is already an option!')
            } else {
              const newOption = {optionLabel: body.newOption};
              poll.options.push(newOption);  
            }
          }
        } else {
          throw("No options from participants are allowed by the creator!");
        }
      }
    }

    poll.save(err => {
      if(err){
        res.status(500).json({message : {msgBody : "Error has occurred: " + err, msgError: true}});
      } else {
        res.status(200).json({message : {msgBody : "Successfully updated poll", msgError : false}, pollId: poll._id, votes: poll.options});
      }
    });

  } catch (error) {
    res.status(404).send({message : {msgBody : "Error has occurred: " + error, msgError: true}});
  }
});

userRouter.delete('/poll/:id', passport.authenticate('jwt', {session : false}), async (req, res) => {
  try {
    const urlID = req.params.id;
    const userID = req.user.id;
    const poll = await Poll.findById(urlID);
    if(poll){
      const pollCreatorString = poll.creator.toString();
      if(pollCreatorString === userID){
        Poll.findByIdAndDelete({_id: urlID}, function(err) {
          if(err){
            res.status(404).json({message : {msgBody : 'There is no poll with the ID of: ' + req.params.id + ' to delete.', msgError : false}, id: poll._id});
          } else {
            res.status(200).json({message : {msgBody : "Successfully deleted poll", msgError : false}, id: poll._id});
          }
        });
      } else{
        res.status(401).json({message: {msgBody: "You're not the creator of this poll!", msgError: true}});
      }
    } else {
      res.status(404).json({message : {msgBody : 'There is no poll with the ID of: ' + req.params.id + ' to delete.', msgError : false}, id: poll._id});
    }
  } catch (error) {
    res.status(404).json({message: {msgBody: "Error has occurred", msgError: true}});
  }
});

userRouter.get('/vote/:id', passport.authenticate('jwt', {session: false}), async (req, res ) => {
  try {
    const urlID = req.params.id;
    const userID = req.user.id;
    const poll = await Poll.findById(urlID);
    const pollCreatorString = poll.creator.toString();
    const isCreator = (pollCreatorString === userID) ? true : false;
    if (isCreator) {
      return res.status(406).json({message: {msgBody: "You're the creator of this poll. Please go to My Polls", msgError: true}});  
    }
    const requireAuthenticatedProfile = poll.requireAuth;
    if (requireAuthenticatedProfile) {
      const savedUserPollIds = req.user.savedPolls;
      const isPollAlreadySaved = (savedUserPollIds.indexOf(urlID) > -1);
      if (isPollAlreadySaved) {
        res.status(200).json({message : {msgBody : "Success", msgError : false}, poll: poll, authenticated : true })  
      } else {
        return res.status(401).json({message: {msgBody: "You must first save the vote in your vote collection in order to be able to interact with the vote", msgError: true}});
      }
    } else {
      const savedUserPollIds = req.user.savedPolls;
      const isPollAlreadySaved = (savedUserPollIds.indexOf(urlID) > -1);
      if (poll.requirePassword === false) {
        res.status(200).json({message : {msgBody : "Success", msgError : false}, poll: poll, authenticated : true });
      } else if (isPollAlreadySaved) {
        res.status(200).json({message : {msgBody : "Success", msgError : false}, poll: poll, authenticated : true });
      }
      return res.status(401).json({message: {msgBody: "You must first save the vote in your vote collection in order to be able to interact with the vote", msgError: true}});
    }
  } catch (error) {
    res.status(404).send('There is no poll with the ID of: ' + req.params.id);
  }
});

userRouter.put('/votes/:id', passport.authenticate('jwt', {session: false}), async (req, res ) => {
  try {
    const bcrypt = require('bcrypt');
    const urlID = req.params.id;
    const userID = req.user.id;
    const userInputPassword = req.body.pollPassword;
    const savedPollIds = req.user.savedPolls;
    const isPollAlreadySaved = (savedPollIds.indexOf(urlID) > -1);

    if (isPollAlreadySaved) {
      return res.status(401).json({message: {msgBody: "The poll is already in your collection", msgError: true}});
    } else {
      const poll = await Poll.findById(urlID);
      const requiredPassword = poll.requirePassword;
      const pollPassword = (poll.pollPassword) ? poll.pollPassword : '';
      const pollCreatorString = poll.creator.toString();
      const isCreator = (pollCreatorString === userID) ? true : false;

      if(isCreator){
        return res.status(401).json({message: {msgBody: "You're the creator of this poll. You cannot add the poll to your voting collection", msgError: true}});
      } else {
        const currentUser = await User.findById({_id : userID});
        if(requiredPassword){
          const validPassword = await bcrypt.compare(userInputPassword, pollPassword);
          if(validPassword){
            currentUser.savedPolls.push(urlID);
          } else {
            return res.status(401).json({message: {msgBody: "This poll needs a password. The given password was wrong. Please try again.", msgError: true}});
          }
        } else {
          currentUser.savedPolls.push(urlID);
        }
        currentUser.save(err => {
          if(err){
            return res.status(500).json({message : {msgBody : "Error has occurred: " + err, msgError: true}});
          } else {
            return res.status(200).json({message : {msgBody : "Successfully add poll to vote collection", msgError : false}, savedPolls: req.user.savedPolls, pollID: urlID});
          }
        })
      }
    }
  } catch (error) {
    res.status(404).send({message : {msgBody : "Error has occurred: " + error, msgError: true}});
  }
});

userRouter.get('/votes', passport.authenticate('jwt', {session: false}), async (req, res ) => {
  const pollIds = req.user.savedPolls;
  const polls = await Poll.find().where('_id').in(pollIds).exec();
  const isEmptyPoll = Object.keys(polls).length === 0;

  if (isEmptyPoll) {
    res.status(404).json({message : {msgBody : 'No saved polls yet!', msgError : false}});
  } else {
    res.status(200).json({polls: polls, authenticated : true});
  }
});

userRouter.get('/admin', passport.authenticate('jwt', {session : false}), (req, res) => {
  if (req.user.role === 'admin') {
    res.status(200).json({message: {msgBody: 'You are an admin', msgError: false}});
  } else {
    res.status(403).json({message: {msgBody: "You're not an admin, go away!", msgError: true}});
  }
});

userRouter.get('/authenticated', passport.authenticate('jwt', {session : false}), (req, res) => {
  const {username, role, _id} = req.user;
  res.status(200).json({isAuthenticated: true, user: {username, role, _id}});
});

module.exports = userRouter;