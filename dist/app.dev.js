"use strict";

var express = require('express');

var app = express();

var cookieParser = require('cookie-parser');

var bodyparser = require('body-parser');

var fileUpload = require('express-fileupload');

var errorMiddleware = require('./middlewares/errors');

app.use(express.json());
app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(fileUpload()); //Import all routes

var products = require('./routes/product');

var auth = require('./routes/auth');

var order = require('./routes/order');

app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', order); // Middleware to handle errors

app.use(errorMiddleware);
module.exports = app;