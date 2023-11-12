const mongoose = require('mongoose');

const otpVerification = new mongoose.Schema({
    user: {
        type:String
    },
    otps: {
        type:String,
    },    
    createdAt: Date,
    expiresAt: Date,
})
const OTPverify = mongoose.model("otp", otpVerification)

module.exports = OTPverify;