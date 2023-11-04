const mongoose = require('mongoose');

const USERSSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'This field is required.'
    },
    qnumber: {
        type: String,
        required: 'This field is required.'
    },
    price:{
        type: String,
        required: 'This field is required.'
    },
    choose: {
        type: [String],
        required: 'This field is required.'
    },
    review:{
        type :String,
        required : 'This field is required.'
    },
    image: {
        type: String,
    },
});

module.exports = mongoose.model('ProductDetail', USERSSchema);