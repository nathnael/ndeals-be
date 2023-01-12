"use strict";

var Product = require('../models/product');

var ErrorHandler = require('../utils/errorHandler');

var catchAsyncErrors = require('../middlewares/catchAsyncErrors.js');

var APIFeatures = require('../utils/apiFeatures'); // Create new product      =>      /api/v1/product/new


exports.newProduct = catchAsyncErrors(function _callee(req, res, next) {
  var product;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          req.body.user = req.user.id;
          _context.next = 3;
          return regeneratorRuntime.awrap(Product.create(req.body));

        case 3:
          product = _context.sent;
          res.status(201).json({
            success: true,
            product: product
          });

        case 5:
        case "end":
          return _context.stop();
      }
    }
  });
}); // Get all products   =>  /api/v1/products?keyword=apple

exports.getProducts = catchAsyncErrors(function _callee2(req, res, next) {
  var apiFeaturesCount, productsTotal, productsCount, apiFeatures, products;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          // const resPerPage = 8;
          apiFeaturesCount = new APIFeatures(Product.find(), req.query).search().filter();
          _context2.next = 3;
          return regeneratorRuntime.awrap(apiFeaturesCount.query);

        case 3:
          productsTotal = _context2.sent;
          productsCount = productsTotal.length;
          console.log("productsCount: ".concat(productsCount));
          apiFeatures = new APIFeatures(Product.find(), req.query).search().filter().pagination();
          _context2.next = 9;
          return regeneratorRuntime.awrap(apiFeatures.query);

        case 9:
          products = _context2.sent;
          res.status(200).json({
            success: true,
            productsCount: productsCount,
            products: products
          });

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  });
}); // Get single product details   =>   /api/v1/product/:id

exports.getSingleProduct = catchAsyncErrors(function _callee3(req, res, next) {
  var product, query, relatedProducts;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(Product.findById(req.params.id));

        case 2:
          product = _context3.sent;

          if (product) {
            _context3.next = 5;
            break;
          }

          return _context3.abrupt("return", next(new ErrorHandler('Product not found', 404)));

        case 5:
          // console.log("**************** Product: " + product.category.map(cat => cat.name));
          query = {
            'category.name': {
              $in: product.category.map(function (cat) {
                return cat.name;
              })
            }
          };
          _context3.next = 8;
          return regeneratorRuntime.awrap(Product.find(query));

        case 8:
          relatedProducts = _context3.sent;
          res.status(200).json({
            success: true,
            product: product,
            relatedProducts: relatedProducts
          });

        case 10:
        case "end":
          return _context3.stop();
      }
    }
  });
}); // Update Product    =>   /api/v1/product/:id

exports.updateProduct = catchAsyncErrors(function _callee4(req, res, next) {
  var product;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(Product.findById(req.params.id));

        case 2:
          product = _context4.sent;

          if (product) {
            _context4.next = 5;
            break;
          }

          return _context4.abrupt("return", next(new ErrorHandler('Product not found', 404)));

        case 5:
          _context4.next = 7;
          return regeneratorRuntime.awrap(Product.findByIdAndUpdate(req.params.id, req.body, {
            "new": true,
            runValidators: false,
            useFindAndModify: false
          }));

        case 7:
          product = _context4.sent;
          res.status(200).json({
            success: true,
            product: product
          });

        case 9:
        case "end":
          return _context4.stop();
      }
    }
  });
}); // Delete Product    =>    /api/v1/admin/product/:id

exports.deleteProduct = catchAsyncErrors(function _callee5(req, res, next) {
  var product;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(Product.findById(req.params.id));

        case 2:
          product = _context5.sent;

          if (product) {
            _context5.next = 5;
            break;
          }

          return _context5.abrupt("return", next(new ErrorHandler('Product not found', 404)));

        case 5:
          _context5.next = 7;
          return regeneratorRuntime.awrap(product.remove());

        case 7:
          res.status(200).json({
            success: true,
            message: "Product is deleted."
          });

        case 8:
        case "end":
          return _context5.stop();
      }
    }
  });
}); // Create new review    =>   /api/v1/review

exports.createProductReview = catchAsyncErrors(function _callee6(req, res, next) {
  var _req$body, rating, comment, productId, review, product, isReviewed;

  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _req$body = req.body, rating = _req$body.rating, comment = _req$body.comment, productId = _req$body.productId;
          review = {
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment: comment
          };
          _context6.next = 4;
          return regeneratorRuntime.awrap(Product.findById(productId));

        case 4:
          product = _context6.sent;
          isReviewed = product.reviews.find(function (r) {
            return r.user.toString() === req.user._id.toString();
          });

          if (isReviewed) {
            product.reviews.forEach(function (review) {
              if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment;
                review.rating = rating;
              }
            });
          } else {
            product.reviews.push(review);
            product.numOfReviews = product.reviews.length;
          }

          product.ratings = product.reviews.reduce(function (acc, item) {
            return item.rating + acc;
          }, 0) / product.reviews.length;
          _context6.next = 10;
          return regeneratorRuntime.awrap(product.save({
            validateBeforeSave: false
          }));

        case 10:
          res.status(200).json({
            success: true
          });

        case 11:
        case "end":
          return _context6.stop();
      }
    }
  });
}); // Get product reviews  =>   /api/v1/reviews

exports.getProductReviews = catchAsyncErrors(function _callee7(req, res, next) {
  var product;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return regeneratorRuntime.awrap(Product.findById(req.query.id));

        case 2:
          product = _context7.sent;
          res.status(200).json({
            success: true,
            reviews: product.reviews
          });

        case 4:
        case "end":
          return _context7.stop();
      }
    }
  });
}); // Delete product reviews  =>   /api/v1/reviews

exports.deleteReview = catchAsyncErrors(function _callee8(req, res, next) {
  var product, reviews, numOfReviews, ratings;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.next = 2;
          return regeneratorRuntime.awrap(Product.findById(req.query.productId));

        case 2:
          product = _context8.sent;
          reviews = product.reviews.filter(function (review) {
            return review._id.toString() !== req.query.id.toString();
          });
          numOfReviews = reviews.length;
          ratings = product.reviews.reduce(function (acc, item) {
            return item.rating + acc;
          }, 0) / reviews.length;
          _context8.next = 8;
          return regeneratorRuntime.awrap(Product.findByIdAndUpdate(req.query.productId, {
            reviews: reviews,
            ratings: ratings,
            numOfReviews: numOfReviews
          }, {
            "new": true,
            runValidators: true,
            useFindAndModify: false
          }));

        case 8:
          res.status(200).json({
            success: true
          });

        case 9:
        case "end":
          return _context8.stop();
      }
    }
  });
}); // Select and Return unique categories with their counts

exports.getUniqueCategories = catchAsyncErrors(function _callee9(req, res, next) {
  var uniqueCategories;
  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.next = 2;
          return regeneratorRuntime.awrap(Product.aggregate([{
            $unwind: "$category" // unwind the categories array

          }, {
            $group: {
              _id: "$category.name",
              // group by the category field
              count: {
                $sum: 1
              } // count the number of instances

            }
          }, {
            $project: {
              _id: 0,
              // exclude the _id field from the result
              category: "$_id",
              // rename the _id field to "category"
              count: 1 // include the count field in the result

            }
          }, {
            $sort: {
              count: -1,
              category: 1
            }
          }, {
            $limit: 10
          }]));

        case 2:
          uniqueCategories = _context9.sent;
          res.status(200).json({
            success: true,
            categories: uniqueCategories
          });

        case 4:
        case "end":
          return _context9.stop();
      }
    }
  });
}); // Select and Return unique categories with their counts

exports.getUniqueSizes = catchAsyncErrors(function _callee10(req, res, next) {
  var uniqueSizes;
  return regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.next = 2;
          return regeneratorRuntime.awrap(Product.aggregate([{
            $unwind: "$variants" // unwind the variants array

          }, {
            $group: {
              _id: "$variants.size",
              // group by the variants field
              count: {
                $sum: 1
              } // count the number of instances

            }
          }, {
            $project: {
              _id: 0,
              // exclude the _id field from the result
              size: "$_id",
              // rename the _id field to "variants.size"
              count: 1 // include the count field in the result

            }
          }, {
            $sort: {
              count: -1,
              size: 1
            }
          }, {
            $limit: 6
          }]));

        case 2:
          uniqueSizes = _context10.sent;
          res.status(200).json({
            success: true,
            sizes: uniqueSizes
          });

        case 4:
        case "end":
          return _context10.stop();
      }
    }
  });
});