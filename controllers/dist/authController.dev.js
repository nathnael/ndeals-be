"use strict";

var User = require('../models/user');

var ErrorHandler = require('../utils/errorHandler');

var catchAsyncErrors = require('../middlewares/catchAsyncErrors');

var sendToken = require('../utils/jwtToken');

var sendEmail = require('../utils/sendEmail');

var crypto = require('crypto');

var cloudinary = require('cloudinary'); // Register a user   =>   /api/v1/register


exports.registerUser = catchAsyncErrors(function _callee(req, res, next) {
  var result, _req$body, newName, newEmail, newPassword, user;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: 'scale'
          }));

        case 2:
          result = _context.sent;
          _req$body = req.body, newName = _req$body.newName, newEmail = _req$body.newEmail, newPassword = _req$body.newPassword;
          console.log("Request data: ".concat(JSON.stringify(req.body)));
          _context.next = 7;
          return regeneratorRuntime.awrap(User.create({
            name: newName,
            email: newEmail,
            password: newPassword,
            avatar: {
              public_id: result.public_id,
              url: result.secure_url
            }
          }));

        case 7:
          user = _context.sent;
          sendToken(user, 200, res);

        case 9:
        case "end":
          return _context.stop();
      }
    }
  });
}); // Login user    =>    /api/v1/login

exports.loginUser = catchAsyncErrors(function _callee2(req, res, next) {
  var _req$body2, email, password, user, isPasswordMatched;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body2 = req.body, email = _req$body2.email, password = _req$body2.password; // Checks is email and password is entered by user

          if (!(!email || !password)) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", next(new ErrorHandler("Please enter email & password", 400)));

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }).select('+password'));

        case 5:
          user = _context2.sent;

          if (user) {
            _context2.next = 8;
            break;
          }

          return _context2.abrupt("return", next(new ErrorHandler("Invalid Email or Password", 401)));

        case 8:
          _context2.next = 10;
          return regeneratorRuntime.awrap(user.comparePassword(password));

        case 10:
          isPasswordMatched = _context2.sent;

          if (isPasswordMatched) {
            _context2.next = 13;
            break;
          }

          return _context2.abrupt("return", next(new ErrorHandler("Invalid Email or Password", 401)));

        case 13:
          sendToken(user, 200, res);

        case 14:
        case "end":
          return _context2.stop();
      }
    }
  });
}); // Forgot Password   =>    /api/v1/password/forgot

exports.forgotPassword = catchAsyncErrors(function _callee3(req, res, next) {
  var user, resetToken, resetUrl, message;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.body.email
          }));

        case 2:
          user = _context3.sent;

          if (user) {
            _context3.next = 5;
            break;
          }

          return _context3.abrupt("return", next(new ErrorHandler('User not found with this email', 404)));

        case 5:
          // Get reset token
          resetToken = user.getResetPasswordToken();
          _context3.next = 8;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 8:
          // Create reset password url
          resetUrl = "".concat(req.protocol, "://").concat(req.get('host'), "/api/v1/password/reset/").concat(resetToken);
          message = "Your password reset token is as follow:\n\n".concat(resetUrl, "\n\nIf you have not requested this email, then ignore it.");
          _context3.prev = 10;
          _context3.next = 13;
          return regeneratorRuntime.awrap(sendEmail({
            email: user.email,
            subject: 'NCommerce Password Recovery',
            message: message
          }));

        case 13:
          res.status(200).json({
            success: true,
            message: "Email sent to: ".concat(user.email)
          });
          _context3.next = 23;
          break;

        case 16:
          _context3.prev = 16;
          _context3.t0 = _context3["catch"](10);
          user.resetPasswordToken = undefined;
          user.resetPasswordExpire = undefined;
          _context3.next = 22;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 22:
          return _context3.abrupt("return", next(new ErrorHandler(_context3.t0.message, 500)));

        case 23:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[10, 16]]);
});
exports.resetPassword = catchAsyncErrors(function _callee4(req, res, next) {
  var resetPasswordToken, user;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          // Hash the URL token
          resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
          _context4.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpire: {
              $gt: Date.now()
            }
          }));

        case 3:
          user = _context4.sent;

          if (user) {
            _context4.next = 6;
            break;
          }

          return _context4.abrupt("return", next(new ErrorHandler('Password reset token is invalid or has been expired', 400)));

        case 6:
          if (!(req.body.password !== req.body.confirmPassword)) {
            _context4.next = 8;
            break;
          }

          return _context4.abrupt("return", next(new ErrorHandler('Password does not match', 400)));

        case 8:
          // Setup new password
          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpire = undefined;
          _context4.next = 13;
          return regeneratorRuntime.awrap(user.save());

        case 13:
          sendToken(user, 200, res);

        case 14:
        case "end":
          return _context4.stop();
      }
    }
  });
}); // Get currently logged in users details   =>   /api/v1/me

exports.getUserprofile = catchAsyncErrors(function _callee5(req, res, next) {
  var user;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.user.id));

        case 2:
          user = _context5.sent;
          sendToken(user, 200, res);

        case 4:
        case "end":
          return _context5.stop();
      }
    }
  });
}); // Update / change password   =>   /api/v1/password/update

exports.updatePassword = catchAsyncErrors(function _callee6(req, res, next) {
  var user, isMatched;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.user.id).select("+password"));

        case 2:
          user = _context6.sent;
          _context6.next = 5;
          return regeneratorRuntime.awrap(user.comparePassword(req.body.oldPassword));

        case 5:
          isMatched = _context6.sent;

          if (isMatched) {
            _context6.next = 8;
            break;
          }

          return _context6.abrupt("return", next(new ErrorHandler("Old password is incorrect")));

        case 8:
          user.password = req.body.password;
          _context6.next = 11;
          return regeneratorRuntime.awrap(user.save());

        case 11:
          sendToken(user, 200, res);

        case 12:
        case "end":
          return _context6.stop();
      }
    }
  });
}); // Update user profile   =>   /api/v1/me/update

exports.updateProfile = catchAsyncErrors(function _callee7(req, res, next) {
  var newUserData, user;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          newUserData = {
            name: req.body.name,
            email: req.body.email
          }; // Update avatar: TODO

          _context7.next = 3;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.user.id, newUserData, {
            "new": true,
            runValidators: true,
            useFindAndModify: false
          }));

        case 3:
          user = _context7.sent;
          res.status(200).json({
            success: true
          });

        case 5:
        case "end":
          return _context7.stop();
      }
    }
  });
}); // Logout user   =>    /api/v1/logout

exports.logout = catchAsyncErrors(function _callee8(req, res, next) {
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          res.cookie('token', null, {
            expires: new Date(Date.now()),
            httpOnly: true
          });
          res.status(200).json({
            success: true,
            message: "Logged out"
          });

        case 2:
        case "end":
          return _context8.stop();
      }
    }
  });
}); // Admin Routes
// Get all users    =>   /api/v1/admin/users

exports.allUsers = catchAsyncErrors(function _callee9(req, res, next) {
  var users;
  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.next = 2;
          return regeneratorRuntime.awrap(User.find());

        case 2:
          users = _context9.sent;
          res.status(200).json({
            success: true,
            users: users
          });

        case 4:
        case "end":
          return _context9.stop();
      }
    }
  });
}); // Get user details    =>    /api/v1/admin/user/:id

exports.getUserDetails = catchAsyncErrors(function _callee10(req, res, next) {
  var user;
  return regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.user.id));

        case 2:
          user = _context10.sent;

          if (user) {
            _context10.next = 5;
            break;
          }

          return _context10.abrupt("return", next(new ErrorHandler("User is not found with id: ".concat(req.params))));

        case 5:
          res.status(200).json({
            success: true,
            user: user
          });

        case 6:
        case "end":
          return _context10.stop();
      }
    }
  });
}); // Update user profile   =>   /api/v1/admin/user/:id

exports.updateUser = catchAsyncErrors(function _callee11(req, res, next) {
  var newUserData, user;
  return regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          newUserData = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role
          };
          _context11.next = 3;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.params.id, newUserData, {
            "new": true,
            runValidators: true,
            useFindAndModify: false
          }));

        case 3:
          user = _context11.sent;
          res.status(200).json({
            success: true
          });

        case 5:
        case "end":
          return _context11.stop();
      }
    }
  });
}); // Delete user    =>    /api/v1/admin/user/:id

exports.deleteUser = catchAsyncErrors(function _callee12(req, res, next) {
  var user;
  return regeneratorRuntime.async(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          _context12.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.params.id));

        case 2:
          user = _context12.sent;

          if (user) {
            _context12.next = 5;
            break;
          }

          return _context12.abrupt("return", next(new ErrorHandler("User is not found with id: ".concat(req.params.id))));

        case 5:
          _context12.next = 7;
          return regeneratorRuntime.awrap(user.remove());

        case 7:
          res.status(200).json({
            success: true
          });

        case 8:
        case "end":
          return _context12.stop();
      }
    }
  });
});