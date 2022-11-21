const express = require('express');
const router = express.Router();

// Importing users controller
const usersCtrl = require('../controllers/users.controller');
const usersMiddleware = require('../middleware/users.middleware');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/create', usersMiddleware.isInputValidated, usersCtrl.createUser);
router.post(
  '/all',
  [authMiddleware.authenticateUser, authMiddleware.isProductCodeInputValidated],
  usersCtrl.getAllUsers
);
router.get('/:id', authMiddleware.authenticateUser, usersCtrl.getUserByID);
router.post(
  '/update',
  [authMiddleware.authenticateUser, authMiddleware.isProductCodeInputValidated],
  usersCtrl.updateUser
);
router.put(
  '/remove/:id',
  [
    authMiddleware.authenticateUser,
    authMiddleware.isProductCodeInputValidated,
    authMiddleware.validateUserProduct,
  ],
  usersCtrl.deleteUser
);

module.exports = router;
