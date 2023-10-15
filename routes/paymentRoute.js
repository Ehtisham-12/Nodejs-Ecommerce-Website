const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth-middleware');

const {
    stripeController
} = require('../controllers/paymentController');


router.route("/stripePayment").post(stripeController);
router.route("/success").get((req,res)=>{
    res.render("success");
})

module.exports = router;
