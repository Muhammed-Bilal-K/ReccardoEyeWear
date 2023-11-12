var user = require('../models/usersdb');
var product = require('../models/productdb');

const admin = {
    email: 'a@m',
    password: '123'
}

exports.adminpage = async (req, res) => {
    try {
            var search = '';
            var limit = 4;
            var page = 1;
            if (req.query.search) {
                search = req.query.search;
            }

            if (req.query.page) {
                page = req.query.page;
            }

            var AllProduct = await product.find({
                $expr: { $ne: [{ $size: "$choose" }, 0] },
                $or: [
                    {
                        name: {
                            $regex: '.*' + search + '.*',
                            $options: 'i'
                        }
                    },
                    {
                        price: {
                            $regex: '.*' + search + '.*',
                            $options: 'i'
                        }
                    }
                ]
            }).limit(limit * 1).skip((page - 1) * limit);

            var count = await product.find({
                $or: [
                    {
                        name: {
                            $regex: '.*' + search + '.*',
                            $options: 'i'
                        }
                    },
                    {
                        price: {
                            $regex: '.*' + search + '.*',
                            $options: 'i'
                        }
                    }
                ]
            }).countDocuments();

            var totalcos = await user.find({ "is_verified": 1 }).count();
            res.render('adminPanel', {
                ProductDoc: AllProduct,
                totalcos,
                totalpage: Math.ceil(count / limit),
                currentPage: page,
                search
            });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.loginpage = async (req, res) => {
    try {
        res.render('adminlogin');
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.addnewone = async (req, res) => {
    try {
        let categ = await product.find({}).distinct("choose");
        res.render('addone', { categ: categ });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.catUp = async (req, res) => {
    try {
        let categ = await product.find({}).distinct("choose");
        res.render('categoryUpd', { categ: categ });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}


exports.updatenewone = async (req, res) => {
    try {
        let id = req.params.id;
        let formattedId = id.replace(/%20/g, ' ');
        let categ = await product.find({}).distinct("choose");
        let EachProduct = await product.findOne({ "_id": formattedId });
        res.render('updateone', { SpecificProduct: EachProduct, categ: categ });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.userSpec = async (req, res) => {
    try {
        let alluser = await user.find({ "is_verified": 1 });
        res.render('adminUserP', { alluser: alluser });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.userDetailsE = async (req, res) => {
    try {
        let uid = req.params.id;
        let userSpec = await user.findOne({ "_id": uid });
        if (userSpec.is_blocked === 0) {
            var access = 'unblock';
        } else {
            var access = 'block';
        }
        res.render('adminuserDetail', { userSpec: userSpec, access: access });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.userCompDelet = async (req, res) => {
    try {
        let uid = req.params.id;
        await user.deleteOne({ "_id": uid });
        res.redirect('/admin/user');
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}


exports.orderList = async (req, res) => {
    try {
        var addsData = await user.find({ "is_verified": 1, "is_blocked": 0 }).populate("orders.products.product_id");
        res.render('adminOrder', { FULLDATA: addsData });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.logoutpage = async (req, res) => {
    try {
        req.session.destroy(() => {
            res.redirect('/admin/login');
        })
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}









///////////////////////////////////////////////////////////////////////

exports.createAdminlogin = async (req, res) => {
    try {
        if (admin.email === req.body.email && admin.password === req.body.password) {
            req.session.adminLog = true;
            req.session.adminData = req.body.email;
            res.redirect('/admin');
        } else {
            res.redirect('/admin/login')
        }
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}


exports.userUpdateDetail = async (req, res) => {
    try {
        var uid = req.params.id;
        var Updchoose = req.body.choose;
        if (Updchoose === "unblock") {
            await user.updateOne({ "_id": uid }, { $set: { is_blocked: 0 } });
        } else {
            await user.updateOne({ "_id": uid }, { $set: { is_blocked: 1 } });
        }
        res.redirect(`/admin/user`);
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.updateCa = async (req, res) => {
    try {
        category = req.body.category;
        await product.updateOne({}, { $push: { choose: category } });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.deleteCa = async (req, res) => {
    try {
        let ch = req.body.choose;
        await product.updateMany({ "choose": ch }, { $pull: { "choose": ch } });
        res.redirect('/admin');
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}


exports.deleOrder = async (req, res, next) => {
    try {
        let UserOrderm = await user.findOne({ "_id": req.body.uID }).populate("orders.products.product_id");
        if (UserOrderm.orders) {
            var firRes = UserOrderm.orders.filter(prod => prod.products);
            if (firRes.products) {
                console.log(firRes.products);
                var last = firRes.products.find(sprod => sprod._id.toString() == req.body.pID);
                console.log(last);
                if (last.status == 'pending') {
                    last.status = 'Delivered';
                }
            }
        }
        await UserOrderm.save().then(() => {
            res.json({ status: true });
        })
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}
