let user = require('../models/usersdb');
let product = require('../models/productdb');
let coupensdb = require('../models/coupondb');
const Razorpay = require('razorpay');
let pdfkit = require('pdfkit');
let fs = require('fs');
var disamount = null;
var coupenidPass;
var instance = new Razorpay({
    key_id: 'rzp_test_w6dIwCMt6fH2NS',
    key_secret: 'enJXg6YSPYMvparSvXKmiWUG',
});

exports.addTocarts = async (req, res) => {
    console.log(req.body);
    console.log(req.params);
    let userId = req.session.userData;
    let pid = req.params.id;
    let mqty = 0;
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
        res.redirect('/cart');

        // if (quantity > equantity) {
        //     mqty = equantity;
        //     // await product.updateOne({ "_id": pid }, { $inc: { qnumber: -mqty } });
        // } else {
        //     mqty = equantity - quantity;
        //     // await product.updateOne({ "_id": pid }, { $set: { qnumber: mqty } });
        // }
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
        let products = productsArray.map(data => ({
            product_id: data.product_id._id,
            qty: data.qty,
            price: data.totalPrice,
            status: 'pending',
            returned: false,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }));

        if (req.body.paymentmethod == 'Card') {

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
            console.log(typeof req.body.coupenid);
            console.log(req.body.coupenid);
            if (req.body.coupenid === '') {
                var cid = null;
            } else {
                var cid = req.body.coupenid;
            }
            console.log(cid);
            let order = {
                products,
                totalamount: disamount,
                paymentmethod: req.body.paymentmethod,
                address,
                coupen_Id: cid,
                created_at: Date.now(),
            }
            disamount = null;
            await user.updateOne({ "_id": userID }, { $push: { orders: order } });
            if (req.body.coupenid) {
                await coupensdb.updateOne({ "_id": req.body.coupenid }, { $addToSet: { usedusers: userID } });
            }
            productData.cart = [];
            await productData.save();
            res.json({ status: true, razorpay_order_id: razorpayOrder.id });
        } else if (req.body.paymentmethod == 'COD') {
            productsArray.map(data => {
                product.updateOne({ "_id": data.product_id._id }, { $inc: { qnumber: -data.qty } }).then((respo) => {
                })
            })
            if (disamount === null) {
                disamount = req.body.totalamount;
            }
            console.log(typeof req.body.coupenid);
            console.log(req.body.coupenid);
            if (req.body.coupenid === '') {
                var cid = null;
            } else {
                var cid = req.body.coupenid;
            }
            console.log(cid);
            console.log(disamount);
            let order = {
                products,
                totalamount: disamount,
                paymentmethod: req.body.paymentmethod,
                address,
                coupen_Id: cid,
                created_at: Date.now(),
            }
            disamount = null;
            await user.updateOne({ "_id": userID }, { $push: { orders: order } });
            if (req.body.coupenid) {
                await coupensdb.updateOne({ "_id": req.body.coupenid }, { $addToSet: { usedusers: userID } });
            }
            productData.cart = [];
            await productData.save();
            res.json({ codSuccuss: true })

        } else if (req.body.paymentmethod == 'Wallet') {

            productsArray.map(data => {
                product.updateOne({ "_id": data.product_id._id }, { $inc: { qnumber: -data.qty } }).then((respo) => {
                })
            })
            if (disamount === null) {
                disamount = req.body.totalamount;
            }
            console.log(typeof req.body.coupenid);
            console.log(req.body.coupenid);
            if (req.body.coupenid === '') {
                var cid = null;
            } else {
                var cid = req.body.coupenid;
            }
            console.log(cid);
            console.log(disamount);
            let order = {
                products,
                totalamount: disamount,
                paymentmethod: req.body.paymentmethod,
                address,
                coupen_Id: cid,
                created_at: Date.now(),
            }
            if (productData.wallet.balance > parseInt(req.body.totalamount)) {
                function generateRandom12DigitNumber() {
                    const min = 100000000000;
                    const max = 999999999999;
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }
                const random12DigitNumber = generateRandom12DigitNumber();
                var remainAmount = productData.wallet.balance - parseInt(disamount);
                productData.wallet.balance = remainAmount;
                productData.wallet.transactions.push({
                    orderId: random12DigitNumber,
                    amount: parseInt(disamount),
                    orderStatus: 'debited',
                    date: Date.now(),
                })
                console.log('hi');
            }
            disamount = null;
            await user.updateOne({ "_id": userID }, { $push: { orders: order } });
            if (req.body.coupenid) {
                await coupensdb.updateOne({ "_id": req.body.coupenid }, { $addToSet: { usedusers: userID } });
            }
            productData.cart = [];
            await productData.save();
            res.json({ walletSuccuss: true })
        } else {
            console.log('nothing');
        }
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}



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

exports.favorite = async (req, res) => {
    let userId = req.session.userData;
    // let userId = '655d79a72dcb692962e0a088';
    let allDeta = await user.findOne({ "_id": userId }).populate('wishlist.prod_id');
    console.log(allDeta.wishlist);
    res.render('user/wishlist', { wishlistData: allDeta.wishlist })
}

exports.changeQUA = async (req, res, next) => {
    try {
        let count = req.body.count;
        let proID = req.body.pro;
        let quantity = req.body.quantity;

        if (count === '-1' && quantity === '1') {
            let UID = req.body.user;
            let UserAddss = await user.findOne({ "_id": UID });
            // if (UserAddss) {
            //     await user.findByIdAndUpdate({ "_id": UID }, { $pull: { cart: { "_id": req.body.cartid } } }, { new: true })
            // }
            // res.redirect('/cart');
            if (UserAddss) {
                return res.json({ RemovePcart: true });
                // return res.json({ RemovePcart: true, redirectToCart: '/cart' });
            }
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
        var walletData = await user.findOne({ "_id": userId }, { wallet: 1 });
        console.log(walletData);
        var allDeta = await user.findOne({ "_id": userId }).populate('cart.product_id');
        if (allDeta.cart != null) {
            var f = allDeta.cart;
        }
        for (var x of f) {
            sumP = sumP + x.totalPrice;
            count++;
        }
        res.render('procedCHECk', { sumP: sumP, ProcsData: allDeta.cart, count: count, address: allDeta.address, emailData, walletData });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.userAdd = async (req, res) => {
    try {
        var uid = req.session.userData;
        var userInfo = await user.findOne({ "_id": uid }, { "name": 1, "email": 1, "p_number": 1 });
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
        let addsData = await user.findOne({ "_id": UID }).populate('orders.products.product_id');
        let shopItem = addsData.orders.find(item => item._id == ID);
        res.render('DVProduct', { Fulldata: shopItem });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.DeleteOrder = async (req, res) => {
    try {
        console.log(req.query);
        let Ordd = req.query.Ordid;
        let Prodd = req.query.proId;
        let UID = req.session.userData;

        await user.updateOne({ _id: UID, 'orders._id': Ordd }, { $pull: { 'orders.$.products': { _id: Prodd } } }
        ).then((respo) => {
            product.updateOne({ _id: req.query.sepId }, { $inc: { qnumber: parseInt(req.query.proQuantity) } }
            ).then((resdata) => {
                res.redirect('/settings/orders');
            })
        })
        let checkRemoveOrder = await user.findOne({ _id: UID }, { orders: 1 });
        let orderData = checkRemoveOrder.orders.find(data => data._id == req.query.Ordid);
        if (orderData.products.length == 0) {
            await user.updateOne({ _id: UID }, { $pull: { orders: { _id: req.query.Ordid } } });
        }
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.returnProducts = async (req, res) => {
    let UID = req.session.userData;
    try {
        console.log(req.query, 'uddd');
        let userData = await user.findOne({ "_id": UID }).populate('orders.products.product_id');
        let result = userData.orders.find((data) => data._id == req.query.Ordid);
        let statusData = result.products.find((datas) => datas._id == req.query.proid);
        res.render('user/returnProduct', { OrderData: result, ProductData: statusData });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.productReturnWithQ = async (req, res) => {
    try {
        console.log(req.body)
        let UID = req.session.userData;
        let Userdata = await user.findOne({ _id: UID }).populate('orders.products.product_id');
        var orderInfo = Userdata.orders.find(item => item._id == req.body.ordderID);

        if (req.body.cuooID === '') {
            var remainData = 0;
        } else {
            let productLength = orderInfo.products.length;
            console.log(productLength);
            let coDisamt = await coupensdb.findOne({ "_id": req.body.cuooID }, { discountamount: 1, _id: 0 });
            console.log(coDisamt);
            var remainData = coDisamt.discountamount / productLength;
            console.log(remainData);
        }

        let statusData = orderInfo.products.find((datas) => datas._id == req.body.prooID);
        if (!statusData.returned) {
            if (req.body.returnReason != 'Product Damaged') {
                await product.updateOne({ _id: req.body.sepID }, { $inc: { qnumber: parseInt(req.body.proqty) } });
            }
            statusData.returned = true;
            statusData.returnReason = req.body.returnReason;
            statusData.returnMethod = req.body.returnMethod;
            console.log(statusData.price);
            var returnAmount = statusData.price - remainData;
            var balanace = Userdata.wallet.balance + returnAmount;
            function generateRandom12DigitNumber() {
                const min = 100000000000;
                const max = 999999999999;
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
            const random12DigitNumber = generateRandom12DigitNumber();
            console.log(returnAmount);
            Userdata.wallet.balance = balanace;
            Userdata.wallet.transactions.push({
                orderId: random12DigitNumber,
                amount: returnAmount,
                orderStatus: 'Credited',
                date: Date.now(),
            })
        }
        await Userdata.save();
        res.redirect(`/settings/orders/view/${req.body.ordderID}`);
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.downloadPdf = async (req, res) => {
    let ID = req.params.id;
    let UID = req.session.userData;
    let addsData = await user.findOne({ "_id": UID }).populate('orders.products.product_id');
    let shopItem = addsData.orders.find(item => item._id == ID);
    console.log(shopItem);
    res.render('user/DownloadInvoice', { AllOrder: shopItem });
}

exports.downloadData = async (req, res) => {
    let orderId = req.params.id;
    let UID = req.session.userData;
    var addsData = await user.findOne({ "_id": UID }).populate('orders.products.product_id');
    var orderData = addsData.orders.find(item => item._id == orderId);
    if (!orderData) {
        return res.status(404).send('Order not found');
    }

    const doc = new pdfkit();
    const fileName = `invoice_${orderData._id}.pdf`;

    doc.pipe(fs.createWriteStream(fileName));

    doc.fontSize(16).text('Invoice', { align: 'center' }).moveDown(0.5);
    doc.fontSize(12).text(`Invoice Number: INV-${orderData._id}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`).moveDown(1);

    doc.text('Billed To:').moveDown(0.5);
    doc.text(`${orderData.address.name}`);
    doc.text(`${orderData.address.address}`);
    doc.text(`${orderData.address.city}, ${orderData.address.state}, ${orderData.address.zipcode}`).moveDown(1);

    doc.fontSize(12).text('Description', { continued: true }).text('Quantity', { continued: true }).text('Price', { continued: true }).text('Total');
    orderData.products.forEach((item) => {
        doc.text(item.product_id.name, { continued: true }).text(item.qty.toString(), { continued: true }).text(`$${item.price.toFixed(2)}`, { continued: true }).text(`$${(item.qty * item.price).toFixed(2)}`);
    });
    doc.moveDown(1);

    doc.text(`Total: $${orderData.totalamount.toFixed(2)}`).moveDown(1);

    doc.text(`Payment Method: ${orderData.paymentmethod}`).moveDown(1);

    doc.fontSize(10).fillColor('#ffffff').text('Thank you for your business!', { align: 'center' });

    doc.end();

    res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-type', 'application/pdf');

    const fileStream = fs.createReadStream(fileName);
    fileStream.pipe(res);
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
            res.json({ dataInvalid: true });
        }

        if (allcuopenData.mincartamount > parseInt(amount)) {
            return res.json({ minAmount: true })
        }
        if (allcuopenData.maxcartamount < parseInt(amount)) {
            return res.json({ maxAmount: true })
        }

        let coupenUpdate = await coupensdb.findOne({ "_id": allcuopenData._id, usedusers: { $eq: UID } });
        console.log(coupenUpdate);
        if (coupenUpdate) {
            res.json({ data: false });
        } else {
            disamount = parseInt(amount) - allcuopenData.discountamount;
            console.log(disamount);
            coupenidPass = allcuopenData._id;
            res.json({ data: true, amountData: disamount, coupenDis: allcuopenData.discountamount, coupenid: allcuopenData._id });
        }
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.removeItemWhishlist = async (req, res) => {
    try {
        let UID = req.session.userData;
        await user.updateOne({ _id: UID, "wishlist._id": req.query.wishid }, { $pull: { wishlist: { _id: req.query.wishid } } });
        res.redirect('/favorite');
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}