const { Router } = require('express');
const authController = require('../../controllers/auth');
const authRouter = Router();

/******************************************************
 * ROUTES
 *****************************************************/

// SIGNUP ROUTE
authRouter.post('/signup', authController.signup);

// LOGIN ROUTE
authRouter.post('/login', authController.login);

// VERIFY LOGED IN USER
authRouter.get('/verify-user', authController.verifyUser);

// LOGOUT ROUTE
authRouter.get('/logout', authController.logout);

module.exports = authRouter;
