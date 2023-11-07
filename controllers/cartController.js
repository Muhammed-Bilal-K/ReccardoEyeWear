var user = require('../models/usersdb');
var product = require('../models/productdb');

exports.addTocarts = async (req, res) => {
    var userId = req.session.userData;
    var pid = req.params.id;
    quantity = req.body.quantity;
    quantity = parseInt(quantity);
    try {
        var ProductExist = await user.findOne({ "_id": userId });


        var productQuanPrice = await product.findOne({ "_id": pid });

        var TotalAmount = parseInt(productQuanPrice.price) * quantity;
        unitPrice = parseInt(productQuanPrice.price);

        var cartItem = ProductExist.cart.find(item => item.product_id.toString() === pid);
        if (!cartItem) {
            await user.updateOne({ "_id": userId }, {
                $push: {
                    "cart": {
                        product_id: pid,
                        qty: quantity,
                        productPrice: unitPrice,
                        totalPrice: TotalAmount,
                    }
                }
            })
        } else {
            var total = TotalAmount;
            await user.updateOne({ "_id": userId, "cart.product_id": pid }, {
                $inc: { "cart.$.qty": quantity, "cart.$.totalPrice": total }
            })
        }

    } catch (error) {
        console.log(error);
    }
}


////////////////////////////////////////////////////////////////////////////////////

exports.cart = async (req, res) => {


    if (req.session.userData) {
        try {
            var totalsum = 0;
            var userId = req.session.userData;
            var allDeta = await user.findOne({ "_id": userId }).populate('cart.product_id');
            var allDet = await user.findOne({ "_id": userId });
            var f = allDeta.cart;
            for (var d of f) {
                totalsum = totalsum + d.totalPrice;
            }
            res.render('cart', { userCart: f, total: totalsum, userID: allDet._id });
        } catch (error) {
            console.log(error);
        }
    } else {
        res.redirect('/login')
    }

}

exports.changeQUA = async (req, res, next) => {
    try {
        console.log(req.body);
        count = parseInt(req.body.count);
        quantity = parseInt(req.body.quantity);
        var Userdata = await user.findOne({ "_id": req.body.user });

        var cartItem = Userdata.cart.find(item => item.product_id.toString() === req.body.pro);
        if (cartItem) {
            if (count === 1) {
                var total = cartItem.productPrice;
            } else {
                var total = -cartItem.productPrice;
            }
            await user.updateOne({ "_id": req.body.user, "cart.product_id": req.body.pro }, {
                $inc: { "cart.$.qty": count, "cart.$.totalPrice": total }
            }).then(()=> {
                res.json({status:true})
            })
        };

    } catch (error) {
        console.log(error);
    }
}        