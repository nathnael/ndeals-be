const express = require('express');
const router = express.Router();

const { 
    getProducts, 
    newProduct, 
    getSingleProduct, 
    updateProduct, 
    deleteProduct,
    createProductReview,
    getProductReviews,
    deleteReview,
    getUniqueCategories,
    getUniqueSizes,
    getUniqueColors,
    getUniqueBrands,
    getPriceRange
} = require('../controllers/productController.js');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.route('/products').get(getProducts);

router.route('/product/:id').get(getSingleProduct);

router.route('/getUniqueCategories').get(getUniqueCategories);

router.route('/getUniqueSizes').get(getUniqueSizes);

router.route('/getUniqueColors').get(getUniqueColors);

router.route('/getUniqueBrands').get(getUniqueBrands);

router.route('/getPriceRange').get(getPriceRange);

router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles("admin"), newProduct);

router.route('/admin/product/:id')
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

router.route('/review').put(isAuthenticatedUser, createProductReview);
router.route('/reviews').get(isAuthenticatedUser, getProductReviews);
router.route('/reviews').delete(isAuthenticatedUser, deleteReview);

module.exports = router;