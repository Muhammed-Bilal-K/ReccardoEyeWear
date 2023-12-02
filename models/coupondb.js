const mongoose = require("mongoose");
const couponSchema = new mongoose.Schema({
    couponname: {
        type: String,
        required: true,
    },
    couponcode: {
        type: String,
        required: true,
    },
    discountamount: {
        type: Number,
        required: true,
    },
    mincartamount: {
        type: Number,
        required: true,
    },
    maxcartamount: {
        type: Number,
        default: true,
    },
    usedusers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EachUser",
        },
    ],
    expired: {
        type: Date,
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
});
const couponModel = mongoose.model("coupon", couponSchema);
module.exports = couponModel;