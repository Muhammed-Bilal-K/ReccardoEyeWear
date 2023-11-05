var user = require('../models/usersdb');
var product = require('../models/productdb');

exports.addTocarts = async (req, res) => {
    var userId = '654745dada18704154866598';
    var pid = req.params.id;
    quantity = req.body.quantity;
    quantity = parseInt(quantity);
    try {
        var ProductExist = await user.findOne({ "_id": userId });


        var productQuanPrice = await product.findOne({"_id":pid});

        var TotalAmount =  parseInt(productQuanPrice.price) * quantity;
        unitPrice = parseInt(productQuanPrice.price);

        var cartItem = ProductExist.cart.find(item => item.product_id.toString() === pid);
        console.log(cartItem);
        if (!cartItem) {
            await user.updateOne({ "_id": userId }, {
                $push: {
                    "cart": {
                        product_id: pid,
                        qty: quantity,
                        productPrice: unitPrice,
                        totalPrice:TotalAmount,
                    }
                }
            })
        } else {
            console.log(TotalAmount);
            var total = TotalAmount;
            await user.updateOne({ "_id": userId, "cart.product_id": pid }, {
                $inc: { "cart.$.qty": quantity , "cart.$.totalPrice" : total}
            })
        }
        
    } catch (error) {
        console.log(error);
    }
}


