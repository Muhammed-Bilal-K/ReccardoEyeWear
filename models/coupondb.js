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
    maxUseCount: {
        type: Number,
        default: 2
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