// SIGNUP CONTROLLER
const signup = (req, res) => {
  const userData = req.body;
  res.status(201).send(userData.name);
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
