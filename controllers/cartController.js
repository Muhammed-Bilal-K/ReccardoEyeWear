let user = require('../models/usersdb');
let product = require('../models/productdb');
let coupensdb = require('../models/coupondb');
const Razorpay = require('razorpay');
var disamount = null;
var coupenidPass ;
var instance = new Razorpay({
    key_id: 'rzp_test_w6dIwCMt6fH2NS',
    key_secret: 'enJXg6YSPYMvparSvXKmiWUG',
});

exports.addTocarts = async (req, res) => {
    let userId = req.session.userData;
    let pid = req.params.id;
    let mqty = 0;
    console.log(pid);
    quantity = req.body.quantity;
    equantity = req.body.equantity
    quantity = parseInt(quantity);
    equantity = parseInt(equantity);
    if (quantity > equantity) {
        quantity = equantity;
    }
    try {
        let ProductExist = await user.findOne({ "_id": userId });
        let productQuanPrice = await product.findOne({ "_id": pid });
        let TotalAmount = parseInt(productQuanPrice.price) * quantity;
        unitPrice = parseInt(productQuanPrice.price);
        let cartItem = ProductExist.cart.find(item => item.product_id.toString() === pid);
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
            let total = TotalAmount;
            await user.updateOne({ "_id": userId, "cart.product_id": pid }, {
                $inc: { "cart.$.qty": quantity, "cart.$.totalPrice": total }
            })
        }
        // if (quantity > equantity) {
        //     mqty = equantity;
        //     // await product.updateOne({ "_id": pid }, { $inc: { qnumber: -mqty } });
        // } else {
        //     mqty = equantity - quantity;
        //     // await product.updateOne({ "_id": pid }, { $set: { qnumber: mqty } });
        // }
        res.redirect('/cart');
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}


exports.processDelivery = async (req, res) => {
    try {

        console.log(req.body);
        let userID = req.session.userData;
        let productData = await user.findOne({ "_id": userID }).populate("cart.product_id");
        let orderadd = productData.address;
        const addres = orderadd.find(add => add._id.equals(req.body.address));
        if (addres) {
            var address = {
                name: addres.name,
                email: addres.email,
                country: addres.select,
                address: addres.address,
                city: addres.city,
                state: addres.state,
                zipcode: addres.zipcode,
                phone: addres.phone
            }
        }
        let productsArray = productData.cart;
        // console.log(productsArray);
        let products = productsArray.map(data => ({
            product_id: data.product_id._id,
            qty: data.qty,
            price: data.totalPrice,
            status: 'pending',
            returned: false,
        }));

        if (req.body.paymentmethod != 'COD') {

            const amountInPaise = Math.round(req.body.totalamount * 100);
            const razorpayOrder = await instance.orders.create({
                amount: amountInPaise,
                currency: 'INR', // Update with your currency
                receipt: '' + new Date().getTime(),
                payment_capture: 1, // Auto capture payment
            });

            productsArray.map(data => {
                product.updateOne({ "_id": data.product_id._id }, { $inc: { qnumber: -data.qty } }).then(() => {
                })
            })
            // var tottalamount = parseInt(req.body.totalamount)-parseInt(disamount);
            if (disamount === null) {
                disamount = req.body.totalamount;
            }
            let order = {
                products,
                totalamount: disamount,
                paymentmethod: req.body.paymentmethod,
                address,
            }
            disamount = null;
            await user.updateOne({ "_id": userID }, { $push: { orders: order } });
            if (req.body.coupenid) {
                await coupensdb.updateOne({"_id":req.body.coupenid},{$addToSet:{usedusers:userID}});
            }
            productData.cart = [];
            await productData.save();
            res.json({ status: true, razorpay_order_id: razorpayOrder.id });
        } else {
            productsArray.map(data => {
                product.updateOne({ "_id": data.product_id._id }, { $inc: { qnumber: -data.qty } }).then((respo) => {
                })
            })
            if (disamount === null) {
                disamount = req.body.totalamount;
            }
            console.log(disamount);
            let order = {
                products,
                totalamount: disamount,
                paymentmethod: req.body.paymentmethod,
                address,
            }
            disamount = null;
            await user.updateOne({ "_id": userID }, { $push: { orders: order } });
            if (req.body.coupenid) {
                await coupensdb.updateOne({"_id":req.body.coupenid},{$addToSet:{usedusers:userID}});
            }
            productData.cart = [];
            await productData.save();
            res.json({ codSuccuss: true })
        }
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

/////////////////////////////////////////////////////////////////////////////////

// exports.processDelivery = async (req, res) => {
//     try {
//         let userID = req.session.userData;
//         let productData = await user.findOne({ "_id": userID }).populate("cart.product_id");
//         let orderadd = productData.address;
//         const addres = orderadd.find(add => add._id.equals(req.body.address));
//         if (addres) {
//             var address = {
//                 name: addres.name,
//                 email: addres.email,
//                 country: addres.select,
//                 address: addres.address,
//                 city: addres.city,
//                 state: addres.state,
//                 zipcode: addres.zipcode
//             }
//         }
//         let productsArray = productData.cart;
//         console.log(productsArray);
//         let products = productsArray.map(data => ({
//             product_id: data.product_id._id,
//             qty: data.qty,
//             price: data.totalPrice,
//             status: 'pending',
//             returned: false,
//         }));
//         productsArray.map(data => {
//             product.updateOne({"_id":data.product_id._id},{$inc:{qnumber:-data.qty}}).then((respo)=>{
//                 console.log(respo);
//             })
//         })
//         let order = {
//             products,
//             totalamount: req.body.totalamount,
//             paymentmethod: req.body.paymentmethod,
//             address,
//         }
//         await user.updateOne({ "_id": userID }, { $push: { orders: order } });
//         productData.cart = [];
//         await productData.save();
//         res.json({ status: true })
//     } catch (error) {
//         const statusCode = error.status || 500;
//         res.status(statusCode).send(error.message);
//     }
// }



/////////////////////////////////////////////////////////////////////////






// exports.processDelivery = async (req, res) => {
//     try {
//         let userID = req.session.userData;
//         console.log(req.body);
//         console.log('hi');
//         let productData = await user.findOne({ "_id": userID }).populate("cart.product_id");
//         let orderadd = productData.address;
//         const addres = orderadd.find(add => add._id.equals(req.body.address));
//         if (addres) {
//             var address = {
//                 name: addres.name,
//                 email: addres.email,
//                 country: addres.select,
//                 address: addres.address,
//                 city: addres.city,
//                 state: addres.state,
//                 zipcode: addres.zipcode
//             }
//         }
//         let productsArray = productData.cart;
//         console.log(productsArray);
//         let products = productsArray.map(data => ({
//             product_id: data.product_id._id,
//             qty: data.qty,
//             price: data.totalPrice,
//             status: 'pending',
//             returned: false,
//         }));
//         productsArray.map(data => {
//             product.updateOne({"_id":data.product_id._id},{$inc:{qnumber:-data.qty}}).then((respo)=>{
//                 console.log(respo);
//             })
//         })
//         let order = {
//             products,
//             totalamount: req.body.totalamount,
//             paymentmethod: req.body.paymentmethod,
//             address,
//         }
//         await user.updateOne({ "_id": userID }, { $push: { orders: order } });
//         productData.cart = [];
//         await productData.save();
//         res.render('OrderComplete');

//     } catch (error) {
//         const statusCode = error.status || 500;
//         res.status(statusCode).send(error.message);
//     }
// }










// exports.processDelivery = async (req, res) => {
//     try {
//         let userID = req.session.userData;
//         if (req.body.paymentmethod == 'COD') {

//         } else {
//             let productData = await user.findOne({ "_id": userID }).populate("cart.product_id");
//             let orderadd = productData.address;
//             const addres = orderadd.find(add => add._id.equals(req.body.address));
//             if (addres) {
//                 var address = {
//                     name: addres.name,
//                     email: addres.email,
//                     country: addres.select,
//                     address: addres.address,
//                     city: addres.city,
//                     state: addres.state,
//                     zipcode: addres.zipcode
//                 }
//             }
//             let productsArray = productData.cart;
//             let products = productsArray.map(data => ({
//                 product_id: data.product_id._id,
//                 qty: data.qty,
//                 price: data.totalPrice,
//                 status: 'pending',
//                 returned: false,
//             }));
//             productsArray.map(data => {
//                 product.updateOne({ "_id": data.product_id._id }, { $inc: { qnumber: -data.qty } }).then(() => {
//                 })
//             })

//             let order = {
//                 products,
//                 totalamount: req.body.totalamount,
//                 paymentmethod: req.body.paymentmethod,
//                 address,
//             };

//             const amountInPaise = Math.round(req.body.totalamount * 100);
//             const razorpayOrder = await instance.orders.create({
//                 amount: amountInPaise,
//                 currency: 'INR', // Update with your currency
//                 receipt: '' + new Date().getTime(),
//                 payment_capture: 1, // Auto capture payment
//             });


//             order.razorpay_order_id = razorpayOrder.id;
//             order.razorpay_payment_id = null;
//             order.razorpay_signature = null;

//                 await user.updateOne({ "_id": userID }, { $push: { orders: order } });
//                 productData.cart = [];
//                 await productData.save();
//             res.render('procedCHECk',{order});
//         }
//     } catch (error) {
//         const statusCode = error.status || 500;
//         res.status(statusCode).send(error.message);
//     }
// }

////////////////////////////////////////GET////////////////////////////////////////////


exports.deliveredOnline = async (req, res) => {
    console.log(req.body, 'hi');
}


exports.cart = async (req, res) => {
    try {
        let totalsum = 0;
        let userId = req.session.userData;
        let allDeta = await user.findOne({ "_id": userId }).populate('cart.product_id');
        let allDet = await user.findOne({ "_id": userId });
        let f = allDeta.cart;
        for (var d of f) {
            totalsum = totalsum + d.totalPrice;
        }
        console.log(f);
        res.render('cart', { userCart: f, total: totalsum, userID: allDet._id });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.changeQUA = async (req, res, next) => {
    try {
        let count = req.body.count;
        let proID = req.body.pro;
        let quantity = req.body.quantity;

        if (count === '-1' && quantity === '1') {
            return res.json({ status: false })
        }
        if (count === '+1') {
            var ccount = 1;
        }
        let data = await product.findOne({ _id: proID });
        quantity = parseInt(req.body.quantity);
        if (data.qnumber <= quantity && ccount === 1) {
            return res.json({ status: false })
        }
        count = parseInt(req.body.count);

        var Userdata = await user.findOne({ "_id": req.body.user });
        var cartItem = Userdata.cart.find(item => item.product_id.toString() === req.body.pro);
        if (cartItem) {
            if (count === 1) {
                var total = cartItem.productPrice;
                // await product.updateOne({ "_id": proID }, { $inc: { "qnumber": -1 } })
            } else {
                var total = -cartItem.productPrice;
                // await product.updateOne({ "_id": proID }, { $inc: { "qnumber": 1 } })
            }
            await user.updateOne({ "_id": req.body.user, "cart.product_id": req.body.pro }, {
                $inc: { "cart.$.qty": count, "cart.$.totalPrice": total }
            }).then(() => {
                res.json({ status: true })
            })
        };

    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.orderProceed = async (req, res) => {
    try {
        var userId = req.session.userData;
        // var userId = '6558654ab003b89039f6b568';
        var sumP = 0;
        var count = 0;
        var emailData = await user.findOne({ "_id": userId }, { "email": 1 });
        var allDeta = await user.findOne({ "_id": userId }).populate('cart.product_id');
        var f = allDeta.cart;
        for (var x of f) {
            sumP = sumP + x.totalPrice;
            count++;
        }
        res.render('procedCHECk', { sumP: sumP, ProcsData: allDeta.cart, count: count, address: allDeta.address, emailData });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.userAdd = async (req, res) => {
    try {
        var uid = req.session.userData;
        var userInfo = await user.findOne({ "_id": uid }, { "name": 1, "email": 1, "p_number": 1 });
        console.log(userInfo);
        res.render('UserAddFirst', { userInfo: userInfo });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.specicAdd = async (req, res) => {
    try {
        var ID = req.session.userData;
        var addsData = await user.findOne({ "_id": ID });
        res.render('UserAddSecond', { addList: addsData.address });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.newuserAdd = async (req, res) => {
    try {
        res.render('addnewUr');
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.listOrder = async (req, res) => {
    try {
        var ID = req.session.userData;
        var addsData = await user.findOne({ "_id": ID }).populate("orders.products.product_id");
        res.render('userordersList', { Alldata: addsData.orders });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.viewEach = async (req, res) => {
    try {
        var ID = req.params.id;
        UID = req.session.userData;
        var addsData = await user.findOne({ "_id": UID }).populate('orders.products.product_id');
        var shopItem = addsData.orders.find(item => item._id == ID);
        res.render('DVProduct', { Fulldata: shopItem });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.returnProducts = async (req, res) => {
    let UID = req.session.userData;
    try {
        let userData = await user.findOne({ "_id": UID }).populate('orders.products.product_id');
        let result = userData.orders.find((data) => data._id == req.query.Ordid);
        let statusData = result.products.find((datas) => datas._id == req.query.proid);
        if (!statusData.returned) {
            statusData.returned = true;
        }
        await userData.save();
        res.redirect(`/settings/orders/view/${req.query.Ordid}`);
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.coupenApply = async (req, res) => {
    let coupenDetail = req.body.coupencode;
    let amount = req.body.datas;
    console.log(req.body);
    let UID = req.session.userData;
    console.log(UID);
    try {
        let allcuopenData = await coupensdb.findOne({ couponcode: coupenDetail, expired: { $gte: new Date() } });
        console.log(allcuopenData);
        if (!allcuopenData) {
            // return res.status(400).send('Invalid coupon code or expired.');
            console.log('invalid');
        }

        let coupenUpdate = await coupensdb.findOne({ "_id": allcuopenData._id, usedusers: { $eq: UID } });
        console.log(coupenUpdate);
        if (coupenUpdate) {
            res.json({data:false});
        } else {
            disamount = parseInt(amount) - allcuopenData.discountamount;
            console.log(disamount);
            coupenidPass = allcuopenData._id;
            res.json({data:true, amountData:disamount, coupenDis : allcuopenData.discountamount , coupenid : allcuopenData._id});
        }
        // if(coupenUpdate === null){
        //     disamount = parseInt(amount) - allcuopenData.discountamount;
        //     console.log(disamount);
        //     coupenidPass = allcuopenData._id;
        //     res.json({data:true, amountData:disamount, coupenDis : allcuopenData.discountamount , coupenid : allcuopenData._id});
        // }else{
        //     res.json({data:false});
        // }
        // let coupenUpdate = await coupensdb.updateOne({ "_id": allcuopenData._id, usedusers: { $ne: UID } },
        // { $addToSet: { usedusers: UID } });
        // if (coupenUpdate.modifiedCount == 0) {
        //     console.log('already');
        // } allcuopenData.discountamount
        
        // disamount = parseInt(amount) - 32;
        // console.log(disamount);

        // // let datasss = await user.updateOne({"_id":UID},{$set:"cart."});
        // res.json({data:true, amountData:disamount, coupenDis : allcuopenData.discountamount})
        
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}