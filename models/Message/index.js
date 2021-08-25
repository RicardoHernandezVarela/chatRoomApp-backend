const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const model = mongoose.model;

const messageSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  room_id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  }
}, {timestamps: true});

const Message = new model('message', messageSchema);

module.exports = Message;
