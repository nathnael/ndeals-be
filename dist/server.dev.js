"use strict";

var app = require('./app');

var connectDatabase = require('./config/database');

var dotenv = require('dotenv');

var cloudinary = require('cloudinary'); // Handle the Uncaught exceptions


process.on('uncaughtException', function (err) {
  console.log("ERROR: ".concat(err.stack));
  console.log('Shutting down server due to uncaught exception');
  process.exit(1);
}); // Setting up config file

dotenv.config({
  path: './config/config.env'
}); // Connecting to database

connectDatabase(); // Setting up cloudinary configuration

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
var server = app.listen(process.env.PORT, function () {
  console.log("Server started on PORT: ".concat(process.env.PORT, " in ").concat(process.env.NODE_ENV, " mode."));
}); // Handle unhandled promise rejections

process.on('unhandledRejection', function (err) {
  console.log("ERROR: ".concat(err.message));
  console.log("Shutting down the server due to Unhandled Promise Rejection");
  server.close(function () {
    process.exit(1);
  });
});