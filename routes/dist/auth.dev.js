"use strict";

var express = require('express');

var router = express.Router();

var _require = require('../controllers/authController'),
    registerUser = _require.registerUser,
    loginUser = _require.loginUser,
    logout = _require.logout,
    forgotPassword = _require.forgotPassword,
    resetPassword = _require.resetPassword,
    getUserprofile = _require.getUserprofile,
    updatePassword = _require.updatePassword,
    updateProfile = _require.updateProfile,
    allUsers = _require.allUsers,
    getUserDetails = _require.getUserDetails,
    updateUser = _require.updateUser,
    deleteUser = _require.deleteUser;

var _require2 = require('../middlewares/auth'),
    isAuthenticatedUser = _require2.isAuthenticatedUser,
    authorizeRoles = _require2.authorizeRoles;

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logout);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword); // router.route('/me').get(isAuthenticatedUser, getUserprofile);

router.route('/me').get(getUserprofile);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);
router.route('/me/update').put(isAuthenticatedUser, updateProfile);
router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'), allUsers);
router.route('/admin/user/:id').get(isAuthenticatedUser, authorizeRoles('admin'), getUserDetails).put(isAuthenticatedUser, authorizeRoles('admin'), updateUser)["delete"](isAuthenticatedUser, authorizeRoles('admin'), deleteUser);
module.exports = router;