// USE MODEL
const User = require('../../models/User');

// CHECK ERROR CREATING USER / ACCOUNT / SIGNUP
const checkErrorCreatingAccount = (error) => {
  const errors = {name: '', email: '', password: ''};

  if (error.errors) {
    const errorArr = Object.values(error.errors);
    errorArr.map((errorItem, index) => {
      const currentError = errorItem.properties;
      errors[currentError.path] = currentError.message;
    });

  } else if (error.message.includes('duplicate key error')) {
    errors.email = 'Email already registered, try with another one';
  }

  return errors;
};

// SIGNUP CONTROLLER
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.create({ name, email, password });
    res.status(201).json(user);
  } catch(error) {
    const errors = checkErrorCreatingAccount(error);
    res.status(400).json(errors);
  }
};

// LOGIN CONTROLLER
const login = (req, res) => {
  const userData = req.body;
  res.status(200).send(userData);
};

// LOGOUT CONTROLLER
const logout = (req, res) => {
  res.send('this is the logout');
};

module.exports = { signup, login, logout };
