const mongoose = require('mongoose');

const USERSSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'This field is required.'
    },
    email: {
        type: String,
        required: 'This field is required.'
    },
    p_number: {
        type: String,
        required: 'This field is required.'
    },
    password: {
        type: String,
        required: 'This field is required.'
    },
    is_verified: {
        type: Number,
        default: 0,
    },
    is_blocked: {
        type: Number,
        default: 0,
    },
    wishlist: [
        {
            prod_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'ProductDetail',
            },
        },
    ],
    wallet: {
        balance: {
            type: Number,
            default: 0
        },
        transactions: [
            {
                orderId: {
                    type: String
                },
                amount: {
                    type: Number,
                    require: true,
                },
                orderStatus: {
                    type: String,
                },
                date: {
                    type: Date,
                }
            }
        ]
    },
    cart: [{
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductDetail' },
        qty: {
            type: Number,
            default: 1
        },
        productPrice: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        }
    }],
    address: {
        type: [{
            name: String,
            email: String,
            select: String,
            address: String,
            city: String,
            state: String,
            zipcode: Number,
            phone: Number,
        }]
    },
    orders: [{
        products: [{
            product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductDetail' },
            qty: {
                type: Number,
            },
            price: {
                type: Number,
            },
            status: {
                type: String,
                default: "pending"
            },
            returned: {
                type: Boolean,
                default: false
            },
            returnReason: {
                type: String, 
                default:null
            },
            returnMethod: {
                type: String, 
                default:null,
            },
            expiresAt: Date,
        }],
        totalamount: {
            type: Number,
        },
        paymentmethod: {
            type: String
        },
        address: {
            name: String,
            email: String,
            country: String,
            address: String,
            city: String,
            state: String,
            zipcode: Number,
            phone: Number,
        },
        coupen_Id: { type: mongoose.Schema.Types.ObjectId, ref: 'coupon', default: null },
        created_at: {
            type: Date,
        },
    }],
    created_at: {
        type: Date,
    },
});

module.exports = mongoose.model('EachUser', USERSSchema);