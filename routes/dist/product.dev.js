"use strict";

var express = require('express');

var router = express.Router();

var _require = require('../controllers/productController.js'),
    getProducts = _require.getProducts,
    newProduct = _require.newProduct,
    getSingleProduct = _require.getSingleProduct,
    updateProduct = _require.updateProduct,
    deleteProduct = _require.deleteProduct,
    createProductReview = _require.createProductReview,
    getProductReviews = _require.getProductReviews,
    deleteReview = _require.deleteReview,
    getUniqueCategories = _require.getUniqueCategories,
    getUniqueSizes = _require.getUniqueSizes,
    getUniqueColors = _require.getUniqueColors,
    getUniqueBrands = _require.getUniqueBrands,
    getPriceRange = _require.getPriceRange;

var _require2 = require('../middlewares/auth'),
    isAuthenticatedUser = _require2.isAuthenticatedUser,
    authorizeRoles = _require2.authorizeRoles;

router.route('/products').get(getProducts);
router.route('/product/:id').get(getSingleProduct);
router.route('/getUniqueCategories').get(getUniqueCategories);
router.route('/getUniqueSizes').get(getUniqueSizes);
router.route('/getUniqueColors').get(getUniqueColors);
router.route('/getUniqueBrands').get(getUniqueBrands);
router.route('/getPriceRange').get(getPriceRange);
router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles("admin"), newProduct);
router.route('/admin/product/:id').put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)["delete"](isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);
router.route('/review').put(isAuthenticatedUser, createProductReview);
router.route('/reviews').get(isAuthenticatedUser, getProductReviews);
router.route('/reviews')["delete"](isAuthenticatedUser, deleteReview);
module.exports = router;