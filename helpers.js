const users = [];

// ADD NEW USER TO CHATROOM
const addUserToChat = (socket_id, name, user_id, room_id) => {
  const response = {
    user: null,
    error: null
  };

  const userExists = users.find((user) => user.room_id === room_id && user.user_id === user_id);

  if (userExists) {
    response.error = 'User already exists in this room';

  } else {
    const user = {socket_id, name, user_id, room_id};
    users.push(user);
    //console.log('users list: ', users);
    response.user = user;
  }

  return response;
};

// REMOVE USER FROM CHATROOM
const removeUserFromChat = (socket_id) => {
  const userIndex = users.findIndex((user) => user.socket_id === socket_id);

  if (userIndex != -1) {
    const removedUser = users.splice(userIndex, 1);
    console.log('removedUser: ', removedUser);
    return removedUser;
  }
};

// GET USER INFO
const getUser = (socket_id) => {
  const user = users.find((user) => user.socket_id === socket_id);
  return user;
};

module.exports = { addUserToChat, removeUserFromChat, getUser };
