const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const socketio = require('socket.io');
const io = socketio(server, {});
const PORT = process.env.PORT || 5000;

const { addUserToChat, removeUserFromChat, getUser } = require('./helpers');

app.get('/', (req, res) => {
  res.send('Hemllo');
});

io.on('connection', (socket) => {
  console.log('a user connected: ', socket.id);

  socket.on('create-room', (room) => {
    console.log(`The new room name is ${room.name}`);
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

server.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});