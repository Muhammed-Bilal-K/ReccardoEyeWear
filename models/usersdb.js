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
    p_number:{
        type: String,
        required: 'This field is required.'
    },
    password: {
        type: String,
        required: 'This field is required.'
    },
    is_verified: {
        type: Number,
        default:0,
    },
    is_blocked: {
        type: Number,
        default:0,
    },
    cart:[{
        product_id:{ type : mongoose.Schema.Types.ObjectId, ref: 'ProductDetail'},
        qty:{
            type:Number,
            default:1
        },
        productPrice:{
            type:Number,
            required: true
        },
        totalPrice:{
            type:Number,
            required: true
        }
    }],
    address: {
        type: [{
            name: String,
            email: String,
            select: String,
            address:String,
            city: String,
            state: String,
            zipcode: Number,
        }]
    },
});

module.exports = mongoose.model('EachUser', USERSSchema);