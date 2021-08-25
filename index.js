const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const mongoose = require('mongoose');

const socketio = require('socket.io');
const io = socketio(server, {});
const PORT = process.env.PORT || 5000;

const { addUserToChat, removeUserFromChat, getUser } = require('./helpers');
const db = require('./dbkey');
const Room = require('./models/Rooms');
const { response } = require('express');

// Mongoose conf
mongoose.set('useFindAndModify', false);

// mongodb connection
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

app.get('/', (req, res) => {
  res.send('Hemllo');
});

io.on('connection', (socket) => {
  console.log('a user connected: ', socket.id);
  Room.find()
    .then(response => {
      io.emit('all-chatrooms', response);
    })
    .catch(error => console.log(error));

  socket.on('create-room', (room) => {
    const newRoom = new Room({name: room.name});
    newRoom.save()
      .then(result => {
        io.emit('chatroom-created', result);
        console.log(`The new room name is ${room.name}`);
      })
      .catch(error => console.log(error));
  });

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
    }
  });

  socket.on('message-sent', ({room_id, message}) => {
    const user = getUser(socket.id);

    if (user) {
      console.log('message-sent', user);
      const msgToStore = {
        name: user.name,
        user_id: user.user_id,
        room_id,
        text: message
      };
      console.log('message: ', msgToStore);
      io.to(room_id).emit('new-message', msgToStore);
    } else {
      console.log('no user connected!');
    }
  });

  socket.on('disconnect', () => {
    // const user = removeUserFromChat(socket.id);
  });
});