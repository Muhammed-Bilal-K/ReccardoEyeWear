var user = require('../models/usersdb');
var product = require('../models/productdb');

exports.addTocarts = async (req, res) => {
    var userId = req.session.userData;
    var pid = req.params.id;
    var mqty = 0;
    console.log(pid);
    quantity = req.body.quantity;
    equantity = req.body.equantity
    quantity = parseInt(quantity);
    equantity = parseInt(equantity);
    if (quantity > equantity) {
        quantity = equantity;
    }
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
        if (quantity > equantity) {
            mqty = equantity;
            await product.updateOne({ "_id": pid }, { $inc: { qnumber: -mqty } });
        } else {
            mqty = equantity - quantity;
            await product.updateOne({ "_id": pid }, { $set: { qnumber: mqty } });
        }
        res.redirect('/cart');
    } catch (error) {
        console.log(error);
    }
}


exports.processDelivery = async (req, res) => {
    var userID = req.session.userData;
    var productData = await user.findOne({ "_id": userID }).populate("cart.product_id");
    var orderadd = productData.address;
    const addres = orderadd.find(add => add._id.equals(req.body.address));
    if (addres) {
        var address = {
            name: addres.name,
            email: addres.email,
            country: addres.select,
            address: addres.address,
            city: addres.city,
            state: addres.state,
            zipcode: addres.zipcode
        }
    }
    var productsArray = productData.cart;
    var products = productsArray.map(data => ({
        product_id: data.product_id._id,
        qty: data.qty,
        price: data.totalPrice,
        status: 'pending',
        returned: false,
    }));
    var order = {
        products,
        totalamount: req.body.totalamount,
        paymentmethod: req.body.radio,
        address,
    }
    await user.updateOne({ "_id": userID }, { $push: { orders: order } });
    productData.cart = [];
    await productData.save();
    res.render('OrderComplete');
}

////////////////////////////////////////GET////////////////////////////////////////////

exports.cart = async (req, res) => {
    try {
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
                console.log(f);
                res.render('cart', { userCart: f, total: totalsum, userID: allDet._id });
            } catch (error) {
                console.log(error);
            }
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error);
    }
}

exports.changeQUA = async (req, res, next) => {
    try {
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
            }).then(() => {
                res.json({ status: true })
            })
        };
    } catch (error) {
        console.log(error);
    }
}

exports.orderProceed = async (req, res) => {
    try {
        if (req.session.userData) {
            var userId = req.session.userData;
            var sumP = 0;
            var count = 0;
            var emailData = await user.findOne({ "_id": userId }, { "email": 1 });
            var allDeta = await user.findOne({ "_id": userId }).populate('cart.product_id');
            console.log(allDeta.address);
            var f = allDeta.cart;
            for (var x of f) {
                sumP = sumP + x.totalPrice;
                count++;
            }
            res.render('procedCHECk', { sumP: sumP, ProcsData: allDeta.cart, count: count, address: allDeta.address, emailData });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error);
    }
}

exports.userAdd = async (req, res) => {
    try {
        if (req.session.userData) {
            var uid = req.session.userData;
            var userInfo = await user.findOne({ "_id": uid }, { "name": 1, "email": 1, "p_number": 1 });
            console.log(userInfo);
            res.render('UserAddFirst', { userInfo: userInfo });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error);
    }
}

exports.specicAdd = async (req, res) => {
    try {
        if (req.session.userData) {
            var ID = req.session.userData;
            var addsData = await user.findOne({ "_id": ID });
            res.render('UserAddSecond', { addList: addsData.address });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error);
    }
}

exports.newuserAdd = async (req, res) => {
    try {
        if (req.session.userData) {
            res.render('addnewUr');
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error);
    }
}

exports.listOrder = async (req, res) => {
    try {
        if (req.session.userData) {
            var ID = req.session.userData;
            var addsData = await user.findOne({ "_id": ID }).populate("orders.products.product_id");
            console.log(addsData);
            res.render('userordersList', { Alldata: addsData.orders });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error);
    }
}

exports.viewEach = async (req, res) => {
    try {
        if (req.session.userData) {
            var ID = req.params.id;
            UID = req.session.userData;
            var addsData = await user.findOne({ "_id": UID }).populate('orders.products.product_id');
            var shopItem = addsData.orders.find(item => item._id == ID);
            res.render('DVProduct', { Fulldata: shopItem });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error);
    }
}