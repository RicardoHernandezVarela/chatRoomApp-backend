// USER MODEL
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

const maxTokenDuration = 5 * 24 * 60 * 60;

// CREATE JWT
const createJWT = (id) => {
  const token = jwt.sign({id}, 'chatroom secret', {
    expiresIn: maxTokenDuration,
  });

  return token;
};

// CHECK ERRORS CREATING USER / ACCOUNT / SIGNUP
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

    // CREATE JWT WITH THE USER ID
    const token = createJWT(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxTokenDuration * 1000 });

    response.user = userResponse;
    res.status(201).json(response);

  } catch(error) {
    const errors = checkErrorCreatingAccount(error);
    response.errors = errors;
    res.status(400).json(response);
  }
};

// LOGIN CONTROLLER
const login = async (req, res) => {
  //console.log('REQ: ', req.headers.origin);
  const { email, password } = req.body;
  const response = {user: null, errors: null};
  const errors = {email: '', password: ''};

  try {
    const user = await User.login(email, password);
    const userResponse = {_id: user._id, name: user.name, email: user.email};

    // CREATE JWT WITH THE USER ID
    const token = createJWT(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxTokenDuration * 1000 });

    response.user = userResponse;
    res.status(201).json(response);

  } catch(error) {
    errors[error.path] = error.message;

    response.errors = errors;
    res.status(400).json(response);
  }
};

// VERIFY LOGED IN USER
const verifyUser = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    // VERIFY USER
    jwt.verify(token, 'chatroom secret', async (error, decodedToken) => {
      //console.log(decodedToken, error);
      const response = {user: null, error: null}

      if (!error) {
        const user = await User.findById(decodedToken.id);
        const userResponse = {_id: user._id, name: user.name, email: user.email};
        
        response.user = userResponse;
        res.status(200).json(response);
        next();

      } else {
        console.log('ERROR VERIFYING TOKEN: ', error);
      }
    });

  } else {
    next();
  }
};

// LOGOUT CONTROLLER
const logout = (req, res) => {
  res.send('this is the logout');
};

module.exports = { signup, login, verifyUser, logout };
