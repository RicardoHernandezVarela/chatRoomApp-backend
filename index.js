const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const socketio = require('socket.io');
const io = socketio(server, {});
const PORT = process.env.PORT || 5000;

// EXPRESS MIDDLEWARE
app.use(express.json());
app.use(cookieParser());

const { addUserToChat, removeUserFromChat, getUser } = require('./helpers');
const db = require('./dbkey');

// AUTH ROUTER
const authRouter = require('./routes/auth');

/* MODELS */
const Room = require('./models/Rooms');
const Message = require('./models/Message');

// MONGOOSE CONF
mongoose.set('useFindAndModify', false);

// MONGODB CONNECTION
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('connected to the db ✌');
        server.listen(PORT, () => {
          console.log(`Listening on port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });

// HOME ROUTE
app.get('/', (req, res) => {
  res.send('Hemllo');
});

// AUTH ROUTES
app.use(authRouter);

// USING COOKIES TEST
app.get('/set-cookies', (req, res) => {
  res.cookie('username', 'rick');
  res.cookie('isAuthenticated', true, { httpOnly: true });
  res.status(200).send('Cookies were set');
});

app.get('/get-cookies', (req, res) => {
  const cookies = req.cookies;
  res.status(200).json(cookies);
});

// SOCKET / USER CONNECTION
io.on('connection', (socket) => {
  console.log('a user connected: ', socket.id);

  // GET ALL CHATROOMS WHEN USER IS CONNECTED ANT RETURN THEM TO THE CLIENT
  Room.find()
    .then(response => {
      io.emit('all-chatrooms', response);
    })
    .catch(error => console.log(error));
  
  // EVENT FIRED WHEN USER CREATES A NEW CHATROOM / SAVE NEW CHATROOM TO THE DB
  socket.on('create-room', (room) => {
    const newRoom = new Room({name: room.name});
    newRoom.save()
      .then(result => {
        io.emit('chatroom-created', result);
        console.log(`The new room name is ${room.name}`);
      })
      .catch(error => console.log(error));
  });

  // EVENT FIRED WHEN USER JOINS TO A CHATROOM
  socket.on('join-user-to-chat', ({name, room_id, user_id}) => {
    const {user, error} = addUserToChat(
      socket.id,
      name,
      user_id,
      room_id
    );

    if (error) {
      console.log('Error joining user to chat: ', error);
    } else {
      console.log('User joined to chat: ', user);
      socket.join(room_id);

      // FIND ALL MESSAGES IN THE CHATROOM AND RETURN THEM TO THE CLIENT
      Message.find({room_id: room_id})
        .then(response => {
          io.emit('all-chatroom-messages', response);
          console.log('all messages: ', response.length);
        })
        .catch(error => console.log(error));
    }
  });

  // EVENT FIRED WHEN USER SENDS A MESSAGE
  socket.on('message-sent', ({room_id, message}) => {
    const user = getUser(socket.id); // GET USER INFO

    if (user) {
      console.log('message-sent', user);
      const msgToStore = {
        name: user.name,
        user_id: user.user_id,
        room_id,
        text: message
      };

      // SAVE NEW MESSAGE TO THE DB
      const newMessage = new Message(msgToStore);
      newMessage.save()
        .then(response => {
          console.log('message: ', response);

          // RETURN NEW MESSAGE TO THE CHATROOM / ALL CLIENTS FROM CHATROOM
          io.to(room_id).emit('new-message', response);
        })
        .catch(error => console.log(error));
    } else {
      console.log('no user connected!');
    }
  });

  // EVENT FIRED WHEN USER DISCONNECTS
  socket.on('disconnect', () => {
    const user = removeUserFromChat(socket.id);
    //console.log('user disconnected: ', user.socket_id);
  });
});