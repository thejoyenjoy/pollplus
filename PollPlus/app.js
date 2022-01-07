const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const mongoose =  require('mongoose');

var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(cookieParser());
//body parser, parse json data from client
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/pollplus', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}, () => {
  console.log('successfully connected to the database');
});

const userRouter = require('./routes/UserRoute');
app.use('/user', userRouter);


// socket: https://medium.com/@rossbulat/react-hooks-managing-web-sockets-with-useeffect-and-usestate-2dfc30eeceec
io.on('connection', socket => {
  console.log('a user connected');
  
  socket.on('disconnect', reason => {
    console.log('user disconnected');
  });

  socket.on('room', data => {
    console.log(data);
    socket.join(data.room);
  });

  socket.on('leave room', data => {
    const { room } = data
    console.log('user: leaving room: ', room);
    socket.leave(room)
  });

  socket.on('update', data => {
    console.log('update room', data.room);
    socket.broadcast
    .to(data.room)
    .emit('update', data)
  });
});

server.listen(5000, () => {
  console.log('express server started');
  console.log('listening to port 5000 :>> ');
})
