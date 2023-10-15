const Orders = require('../models/orderModel');
const userModel = require('../models/userModel');
const Products = require('../models/productModel');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// Create Order
const createOrder = async (req, res) => {
    req.body.user = req.user.userId;
    req.body.paidAt = Date.now();

    const order = await Orders.create(req.body);
    res.status(200).json(order);
}

// Get User Relevent Orders
const getUserOrder = async (req, res) => {
    const order = await Orders.find({ user: req.user.userId });
    // res.status(200).json({order});
    res.status(200).render('user-order', { order, image: req.user.image });
}

// Get All Orders (Admin)
const getAllOrder = async (req, res) => {
    const order = await Orders.find();
    res.status(200).render('admin-orders', { order, image: req.user.image })
}


// Get single order detail (For Admin)
const getSingleOrderAdmin = async (req, res) => {
    const { id } = req.params;
    const order = await Orders.findById({ _id: id });
    const user = await userModel.findById({ _id: order.user });
    res.status(200).render('admin-single-order', { order, image: req.user.image, name: user.name });
}

// Updating order Status (For Admin)
const updateSingleOrderStatus = async (req, res) => {
    const { id } = req.params;
    const order = await Orders.findByIdAndUpdate(id, { orderStatus: req.body.orderStatus }, { runValidators: true, new: true });
    if (order.orderStatus === 'Shipped') {
        order.orderItems.forEach(async (item) => {
            const productStock = await Products.findById({ _id: item.productId });
            let totalProductStock = productStock.stock;
            const product = await Products.findByIdAndUpdate(item.productId, { stock: totalProductStock - item.qty }, { runValidators: true, new: true });
        })
    }
    res.status(200).json(order);
}

// Send Alert to user after successfully delivered
const deliveryAlert = async (req, res) => {
    const id = req.user.userId;
    const order = await Orders.find({ user: id });
    let deliveredItem = order.filter(item => {
        return item.orderStatus === 'Delivered';
    })
    res.status(200).json({ totalItems: deliveredItem.length });
}

// Get Delivered Item of User And Update User Viewed Status
const deliveredItems = async (req, res) => {
    const id = req.user.userId;
    const order = await Orders.find({ user: id });

    let deliveredItem = order.filter(item => {
        return item.orderStatus === 'Delivered';
    })

    deliveredItem.forEach(async (item) => {
        item.orderStatus = 'Viewed';
        let order = await Orders.findByIdAndUpdate({ _id: item._id }, { orderStatus: 'Viewed' }, { runValidators: true, new: true });
    })

    let viewDeliveredItem = order.filter(item => {
        return item.orderStatus === 'Viewed';
    })

    let filterForReview = viewDeliveredItem.map(item => {
        return {
            ...item,
            orderItems: item.orderItems.filter(item => item.productReviewed === 'No')
        }
    })
    // console.log(filterForReview);
    res.status(200).render('review-ui', { image: req.user.image, filterForReview });
}

// Get Reviewed Items History (For User)
const reviewedHistory = async (req, res) => {
    const id = req.user.userId;
    
    let data = await Orders.aggregate([
        {
            $match:{
                "user": ObjectId(`${id}`)
            }
        },
        {
            $unwind: '$orderItems'
        },
        
        {
            $lookup:{
                from: 'products',
                localField: 'orderItems.productId',
                foreignField: '_id',
                as:'result'
            }
        },
        {
            $unwind: '$result'
        },
        
        {$project:{'result.reviews':1, orderItems:1, _id:0}}
        
    ])

    
    // Reviewed Items Array List
    let filterForReviewHistory = data.filter(item => {
        return item.orderItems.productReviewed === 'Yes';
    })
 
    
   let actualData =  filterForReviewHistory.map(item => {
        const {result,orderItems} = item;
          let a =  result.reviews.filter(item => {
                return item.orderId == orderItems._id;
            })
            let [obj] = a
            return {
                orderItems,
                obj
            };
    })

    res.status(200).json({ data: actualData});
}

// Delete User Order (Admin)
const deleteUserOrder = async (req, res) => {
    const { id } = req.params;
    const order = await Orders.findByIdAndDelete({ _id: id });
    res.status(200).redirect('/admin/all-orders');
}

module.exports = {
    createOrder,
    getUserOrder,
    getAllOrder,
    getSingleOrderAdmin,
    updateSingleOrderStatus,
    deliveredItems,
    deliveryAlert,
    reviewedHistory,
    deleteUserOrder
}