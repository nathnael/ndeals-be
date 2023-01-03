"use strict";

var mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true,
    maxLength: [100, 'Product name cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
    maxLength: [100, 'Product name cannot exceed 5 characters'],
    "default": 0.0
  },
  sale_price: {
    type: Number,
    required: [true, 'Please enter product price'],
    maxLength: [100, 'Product name cannot exceed 5 characters'],
    "default": 0.0
  },
  description: {
    type: String,
    required: [true, 'Please enter product description']
  },
  ratings: {
    type: Number,
    "default": 0
  },
  sm_pictures: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  category: [{
    name: {
      type: String,
      required: [true, 'Please select category name for this product']
    },
    slug: {
      type: String,
      required: [true, 'Please select category slug for this product']
    }
  }],
  seller: {
    type: String,
    required: [true, 'Please enter product seller']
  },
  stock: {
    type: Number,
    required: [true, 'Please enter product stock'],
    maxLength: [5, 'Product stock cannot exceed 5 characters'],
    "default": 0
  },
  numOfReviews: {
    type: Number,
    "default": 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true
    },
    comment: {
      type: String,
      required: true
    }
  }],
  variants: [{
    colorName: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    size: {
      type: String,
      required: true
    },
    brand: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },
  slug: {
    type: String
  },
  "new": {
    type: Boolean,
    "default": false
  },
  top: {
    type: Boolean,
    "default": false
  },
  createdAt: {
    type: Date,
    "default": Date.now
  }
});
module.exports = mongoose.model('Product', productSchema);