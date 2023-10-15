const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth-middleware');
const authRole = require('../middleware/authRole');

const {
    createProduct,
    getAllProducts,
    getAllProductsPage,
    getAllProductsAdmin,
    getSingleProduct,
    productReview,
    deleteProductReview,
    getSingleProductReview,
    deleteProduct,
    editProductAdmin,
    editProduct
} = require('../controllers/productController');

// Get All Products 
router.route('/').get(getAllProducts);

// Get All Products For Product Page
router.route('/products').get(getAllProductsPage);

// Get All Products (Admin)
router.route('/admin/all-products').get(auth, authRole, getAllProductsAdmin);

// Create New Product (Admin)
router.route('/admin/create').get(auth, authRole, (req,res) => {
    res.render('create-product', {name:req.user.name, id:req.user.userId, email:req.user.email, joined:req.user.joined, image:req.user.image});
});

// Product Review
router.route('/create-reviews').put(auth, productReview);

// Delete Product Review 
router.route('/delete-review/:id').post(auth, authRole, deleteProductReview);

// Cart Items 
router.route('/cart').get((req,res)=>{
    res.render('cart');
})

// Shipping
router.route('/shipping').get(auth, (req,res)=>{
    res.render('shipping');
})
// Get Single Product (Public Route)
router.route('/product/:id').get(getSingleProduct);

router.route('/admin/create-product').post(auth, authRole, createProduct);

// Get single product
router.route('/admin/product/:id').get(auth, authRole, editProductAdmin).post(auth, authRole, editProduct);


// Delete Product (Admin)
router.route('/product/delete/:id').get(auth, authRole, deleteProduct);

// Get Single Product All Reviews (Admin)
router.route('/admin/all-reviews').get(auth, authRole, async (req,res) => {
    res.render('admin-reviews', {image:req.user.image})
})

// Get Single Product Review By Search (Admin)
router.route('/admin/single-review/:id').get(auth, authRole, getSingleProductReview);



module.exports = router;