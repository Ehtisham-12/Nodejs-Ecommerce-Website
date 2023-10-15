const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth-middleware');
const authRole = require('../middleware/authRole');


const {
    createOrder,
    getUserOrder,
    getAllOrder,
    getSingleOrderAdmin,
    updateSingleOrderStatus,
    deliveredItems,
    deliveryAlert,
    reviewedHistory,
    deleteUserOrder
} = require('../controllers/orderController');

router.route('/order/confirm').get(auth, (req,res)=>{
    res.render('confirm-order', {name:req.user.name});
})

router.route('/process/payment').get(auth, (req,res)=>{
    res.render('payment');
})

router.route('/create/order').post(auth, createOrder)

// Get User Relevent Order Route

router.route('/orders').get(auth, getUserOrder);

// Get All Orders (Admin)
router.route('/admin/all-orders').get(auth, authRole, getAllOrder);

// Get Single Order (Admin)
router.route('/admin/order/:id').get(auth, authRole, getSingleOrderAdmin);

// Updata Single Order Status (For Admin)
router.route('/admin/order/:id').put(updateSingleOrderStatus)

// Get User Delivered Items
router.route('/order/review').get(auth, deliveredItems)

// Get User Reviewed History
router.route('/order/reviewed').get(auth, reviewedHistory);

// Total Deliver Items
router.route('/total/delivered').get(auth, deliveryAlert);

// Delete User Order (Admin)
router.route('/admin/order/delete/:id').get(auth, authRole, deleteUserOrder)

module.exports = router;