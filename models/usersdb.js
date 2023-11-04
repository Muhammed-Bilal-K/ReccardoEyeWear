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
});

module.exports = mongoose.model('EachUser', USERSSchema);