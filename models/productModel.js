const mongoose = require('mongoose');


const Products = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Define Product Name'],
        // minLength: 10,
    },
    description: {
        type: String,
        required: [true, 'Please Enter Product Description']
    },
    price: {
        type: Number,
        required: [true, 'Please Enter Product Price'],
        maxLength: [8, 'Price should not exceed 8 character']
    },
    rating: {
        type: Number,
        default: 0
    },
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            }
        }
    ],
    category: {
        type: String,
        required: [true, 'Please Enter Product Category'],
    },
    stock: {
        type: Number,
        required: [true, 'Please Enter Product Stock'],
        maxLength: [4, 'Stock cannot exceed 4 character'],
        default: 1
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                required: true
            },
            orderId: {
                type:String,
                required:true
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }

})

module.exports = mongoose.model('Products', Products); 