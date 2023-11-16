const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'This field is required.'
    },
    qnumber: {
        type: Number,
        required: 'This field is required.'
    },
    price:{
        type: Number,
        required: 'This field is required.'
    },
    category: {
        // type: mongoose.Schema.Types.ObjectId, ref: 'categories', 
        type: String,
        required: 'This field is required.'
    },
    description:{
        type :String,
        required : 'This field is required.'
    },
    image: {
        type: Array,
    },
    unlist:{
        type:Boolean,
        default:false
    }
});

module.exports = mongoose.model('ProductDetail', ProductSchema);