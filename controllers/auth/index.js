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
  const response = {user: null, errors: null};

  try {
    const user = await User.create({ name, email, password });
    const userResponse = {_id: user._id, name: user.name, email: user.email};
    response.user = userResponse;
    res.status(201).json(response);

  } catch(error) {
    const errors = checkErrorCreatingAccount(error);
    response.errors = errors;
    res.status(400).json(response);
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
