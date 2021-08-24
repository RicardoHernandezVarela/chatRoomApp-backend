const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const model = mongoose.model;

const roomSchema = new Schema({
  name: {
    type: String,
    required: true
  }
}, {timestamps: true});

const Room = new model('Room', roomSchema);

module.exports = Room;