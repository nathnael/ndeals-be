const axios = require('axios');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client();
const User = require('../models/user');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');

const crypto = require('crypto');
const cloudinary = require('cloudinary');

async function verify() {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
}

// Register a user   =>   /api/v1/register
exports.registerUser = catchAsyncErrors(async(req, res, next) => {

    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: 'avatars',
        width: 150,
        crop: 'scale'
    })

    const { newName, newEmail, newPassword } = req.body;

    console.log(`Request data: ${JSON.stringify(req.body)}`);

    const user = await User.create({
        name: newName,
        email: newEmail,
        password: newPassword,
        avatar: {
            public_id: result.public_id,
            url: result.secure_url
        }
    });

    sendToken(user, 200, res);
})

// Login user    =>    /api/v1/login
exports.loginUser = catchAsyncErrors( async (req, res, next) => {
    const { email, password } = req.body;

    // Checks is email and password is entered by user
    if(!email || !password) {
        return next(new ErrorHandler(`Please enter email & password`, 400));
    }

    // Finding user in database
    const user = await User.findOne({ email }).select('+password');

    if(!user) {
        return next(new ErrorHandler(`Invalid Email or Password`, 401));
    }

    // Checks if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched) {
        return next(new ErrorHandler(`Invalid Email or Password`, 401));
    }

    sendToken(user, 200, res);
})

exports.googleLoginUser = catchAsyncErrors( async (req, res, next) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: req.body.credential,
            audience: req.body.clientId,  
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];

        // console.log('User Details:', payload);

        // Check if the email is verified
        if(payload.email_verified) {
            // Login user if the email is already registered on Ndeals
            const user = await User.findOne({ email: payload.email }).select('+password');
            if(user) {
                return sendToken(user, 200, res);
            } 
            // If not registered, register user on Ndeals and login user
            else {
                const result = await cloudinary.v2.uploader.upload(payload.picture, {
                    folder: 'avatars',
                    width: 150,
                    crop: 'scale'
                });

                const user = await User.create({
                    name: payload.name,
                    email: payload.email,
                    password: payload.sub,
                    avatar: {
                        public_id: result.public_id,
                        url: result.secure_url
                    }
                    
                });

                return sendToken(user, 200, res);
            }
        }

        res.status(500).json({ message: 'Authentication failed' });

    } catch (error) {
        // console.error('Error saving code:', error);
        res.status(500).json({ message: 'Failed to save code' });
    }
});

// Forgot Password   =>    /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if(!user) {
        return next(new ErrorHandler('User not found with this email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset password url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'NCommerce Password Recovery',
            message
        });

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));
    }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // Hash the URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if(!user) {
        return next(new ErrorHandler('Password reset token is invalid or has been expired', 400));
    }

    if(req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match', 400));
    }

    // Setup new password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
});

// Get currently logged in users details   =>   /api/v1/me
exports.getUserprofile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    sendToken(user, 200, res);

});

// Update / change password   =>   /api/v1/password/update
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select(`+password`);

    // Check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword);
    if(!isMatched) {
        return next(new ErrorHandler(`Old password is incorrect`));
    }

    user.password = req.body.password;
    await user.save();

    sendToken(user, 200, res);
});

// Update user profile   =>   /api/v1/me/update
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    };

    // Update avatar: TODO

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true
    });
});

// Logout user   =>    /api/v1/logout
exports.logout = catchAsyncErrors( async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: "Logged out"
    });
});

// Admin Routes


// Get all users    =>   /api/v1/admin/users
exports.allUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    });
});

// Get user details    =>    /api/v1/admin/user/:id
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if(!user) {
        return next(new ErrorHandler(`User is not found with id: ${req.params}`));
    }

    res.status(200).json({
        success: true,
        user
    });
});

// Update user profile   =>   /api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    };
    
    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true
    });
});

// Delete user    =>    /api/v1/admin/user/:id
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorHandler(`User is not found with id: ${req.params.id}`));
    }

    // Remove avatar from Cloudinary - TODO

    await user.remove();

    res.status(200).json({
        success: true
    });
});