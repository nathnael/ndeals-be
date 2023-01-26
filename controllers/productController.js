const Product = require('../models/product');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors.js');
const APIFeatures = require('../utils/apiFeatures');

// Create new product      =>      /api/v1/product/new
exports.newProduct = catchAsyncErrors (async (req, res, next) => {
    req.body.user = req.user.id;   
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        product
    })
});


// Get all products   =>  /api/v1/products?keyword=apple
exports.getProducts = catchAsyncErrors (async (req, res, next) => {

    // const resPerPage = 8;
    const apiFeaturesCount = new APIFeatures(Product.find(), req.query)
                            .search()
                            .filter();
    const productsTotal = await apiFeaturesCount.query;

    const productsCount = productsTotal.length;

    // console.log(`productsCount: ${productsCount}`)


    const apiFeatures = new APIFeatures(Product.find(), req.query, productsCount)
                            .search()
                            .filter()
                            .pagination();
    const products = await apiFeatures.query;

    
    res.status(200).json({
        success: true,
        productsCount,
        products
    })
    
});

// Get single product details   =>   /api/v1/product/:id
exports.getSingleProduct = catchAsyncErrors (async (req, res, next) => {
    // console.log("**************** req.params.id: " + req.params.id);

    const productDetails = await Product.findById(req.params.id);
    if(!productDetails) {
        return next(new ErrorHandler('Product not found', 404));
    }

    // console.log("**************** Product: " + product.category.map(cat => cat.name));

    const query = { 'category.name':  { $in: productDetails.category.map(cat => cat.name) } };
    const relatedProducts = await Product.find(query);

    res.status(200).json({
        success: true,
        productDetails,
        relatedProducts
    })
});

// Update Product    =>   /api/v1/product/:id
exports.updateProduct = catchAsyncErrors (async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if(!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: false,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        product
    })
});


// Delete Product    =>    /api/v1/admin/product/:id
exports.deleteProduct = catchAsyncErrors (async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if(!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    await product.remove();

    res.status(200).json({
        success: true,
        message: "Product is deleted."
    });
});


// Create new review    =>   /api/v1/review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    );

    if(isReviewed) {
        product.reviews.forEach(review => {
            if(review.user.toString() === req.user._id.toString()) {
                review.comment = comment;
                review.rating = rating;
            }
        })
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    })
});


// Get product reviews  =>   /api/v1/reviews
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    res.status(200).json({
        success: true,
        reviews: product.reviews
    });
});

// Delete product reviews  =>   /api/v1/reviews
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());

    const numOfReviews = reviews.length;

    const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true
    });
});

// Select and Return unique categories with their counts
exports.getUniqueCategories = catchAsyncErrors(async (req, res, next) => {
    // const uniqueCategories = await Product.find().distinct("category.name");
    const uniqueCategories = await Product.aggregate([
        {
            $unwind: "$category" // unwind the categories array
        },
        {
            $group: {
                _id: "$category.name", // group by the category field
                count: { $sum: 1 } // count the number of instances
            }
        },
        {
            $project: {
                _id: 0, // exclude the _id field from the result
                category: "$_id", // rename the _id field to "category"
                count: 1 // include the count field in the result
            }
        },
        {
            $sort: {
                count: -1,
                category: 1               
            }
        },
        {
            $limit: 10
        }
    ]);

    res.status(200).json({
        success: true,
        categories: uniqueCategories
    });
});

// Select and Return unique sizes with their counts
exports.getUniqueSizes = catchAsyncErrors(async (req, res, next) => {
    const uniqueSizes = await Product.aggregate([
        {
            $unwind: "$variants" // unwind the variants array
        },
        {
            $group: {
                _id: "$variants.size", // group by the variants field
                count: { $sum: 1 } // count the number of instances
            }
        },
        {
            $project: {
                _id: 0, // exclude the _id field from the result
                size: "$_id", // rename the _id field to "variants.size"
                count: 1 // include the count field in the result
            }
        },
        {
            $sort: {
                count: -1,
                size: 1               
            }
        },
        {
            $limit: 6
        }
    ]);

    res.status(200).json({
        success: true,
        sizes: uniqueSizes
    });
});

// Select and Return unique colors with their counts
exports.getUniqueColors = catchAsyncErrors(async (req, res, next) => {
    const uniqueColors = await Product.aggregate([
        {
            $unwind: "$variants" // unwind the variants array
        },
        {
            $group: {
                _id: { color: "$variants.color", colorName: "$variants.colorName"}, // group by the variants field
                count: { $sum: 1 } // count the number of instances
            }
        },
        {
            $project: {
                _id: 0, // exclude the _id field from the result
                color: "$_id.color", // rename the _id field to "variants.color"
                colorName: "$_id.colorName", // rename the _id field to "variants.colorName"
                count: 1 // include the count field in the result
            }
        },
        {
            $sort: {
                count: -1,
                colorName: 1               
            }
        },
        {
            $limit: 10
        }
    ]);

    res.status(200).json({
        success: true,
        colors: uniqueColors
    });
});

// Select and Return unique brands with their counts
exports.getUniqueBrands = catchAsyncErrors(async (req, res, next) => {
    const uniqueBrands = await Product.aggregate([
        {
            $unwind: "$variants" // unwind the variants array
        },
        {
            $group: {
                _id: "$variants.brand", // group by the variants field
                count: { $sum: 1 } // count the number of instances
            }
        },
        {
            $project: {
                _id: 0, // exclude the _id field from the result
                brand: "$_id", // rename the _id field to "variants.brand"
                count: 1 // include the count field in the result
            }
        },
        {
            $sort: {
                count: -1,
                brand: 1               
            }
        },
        {
            $limit: 6
        }
    ]);

    res.status(200).json({
        success: true,
        brands: uniqueBrands
    });
});


// Select and Return unique brands with their counts
exports.getPriceRange = catchAsyncErrors(async (req, res, next) => {

    const minPrice = await Product.find({}).sort({ price: 1 }).limit(1).then(product => product[0].price);

    const maxPrice = await Product.find({}).sort({ price: -1 }).limit(1).then(product => product[0].price);
    
    res.status(200).json({
        success: true,
        minPrice,
        maxPrice
    });
});