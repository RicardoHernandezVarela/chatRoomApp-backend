const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const model = mongoose.model;
const { isEmail } = require('validator');
const bcrypt = require('bcrypt'); 

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name']
  },
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please enter a valid email adress']
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password should be at least 6 characters long']
  },
}, {timestamps: true});

// HASHING PASSWORD
userSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

const User = new model('user', userSchema);

module.exports = User;
