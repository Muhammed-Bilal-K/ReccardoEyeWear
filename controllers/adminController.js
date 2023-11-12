var user = require('../models/usersdb');
var product = require('../models/productdb');

const admin = {
    email: 'a@m',
    password: '123'
}

exports.adminpage = async (req, res) => {
    try {
        if (req.session.adminData) {
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
        } else {
            res.redirect('admin/login');
        }
    } catch (error) {
        console.log(error);
    }
}



exports.loginpage = async (req, res) => {
    if (req.session.adminLog) {
        res.redirect('/admin');
    } else {
        res.render('adminlogin');
    }
}


exports.addnewone = async (req, res) => {
    if (req.session.adminData) {
        var categ = await product.find({}).distinct("choose");
        console.log(categ);
        res.render('addone', { categ: categ });
    } else {
        res.redirect('/admin/login');
    }
}

exports.catUp = async (req, res) => {
    if (req.session.adminData) {
        var categ = await product.find({}).distinct("choose");
        console.log(categ);
        res.render('categoryUpd', { categ: categ });
    } else {
        res.redirect('/admin/login');
    }
}


exports.updatenewone = async (req, res) => {
    if (req.session.adminData) {
        var id = req.params.id;
        var formattedId = id.replace(/%20/g, ' ');
        var categ = await product.find({}).distinct("choose");
        var EachProduct = await product.findOne({ "_id": formattedId });
        console.log(EachProduct);
        res.render('updateone', { SpecificProduct: EachProduct, categ: categ });
    } else {
        res.redirect('/admin/login');
    }
}

exports.userSpec = async (req, res) => {
    if (req.session.adminData) {
        var alluser = await user.find({ "is_verified": 1 });
        res.render('adminUserP', { alluser: alluser });
    } else {
        res.redirect('/admin/login');
    }
}

exports.userDetailsE = async (req, res) => {
    if (req.session.adminData) {
        var uid = req.params.id;
        var userSpec = await user.findOne({ "_id": uid });
        if (userSpec.is_blocked === 0) {
            var access = 'unblock';
        } else {
            var access = 'block';
        }
        res.render('adminuserDetail', { userSpec: userSpec, access: access });
    } else {
        res.redirect('/admin/login');
    }
}

exports.userCompDelet = async (req, res) => {
    try {
        if (req.session.adminData) {
            var uid = req.params.id;
            await user.deleteOne({ "_id": uid });
            res.redirect('/admin/user');
        } else {
            res.redirect('/admin/login');
        }
    } catch (error) {
        console.log(error);
    }
}


exports.orderList = async (req, res) => {
    try {
        if (req.session.adminData) {
            var addsData = await user.find({ "is_verified": 1, "is_blocked": 0 }).populate("orders.products.product_id");
            res.render('adminOrder', { FULLDATA: addsData });
        } else {
            res.redirect('/admin/login');
        }
    } catch (error) {
        console.log(error);
    }
}

exports.logoutpage = async (req, res) => {
    try {
        req.session.destroy(() => {
            res.redirect('/admin/login');
        })
    } catch (error) {
        console.log(error);
    }
}









///////////////////////////////////////////////////////////////////////

exports.createAdminlogin = async (req, res) => {
    try {
        if (admin.email === req.body.email && admin.password === req.body.password) {
            req.session.adminLog = true;
            req.session.adminData = req.body;
            res.redirect('/admin');
        } else {
            res.redirect('/admin/login')
        }
    } catch (error) {
        console.log(error);
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
        console.log(error);
    }
}

exports.updateCa = async (req, res) => {
    try {
        category = req.body.category;
        await product.updateOne({}, { $push: { choose: category } });
    } catch (error) {
        console.log(error);
    }
}

exports.deleteCa = async (req, res) => {
    try {
        var ch = req.body.choose;
        var result = await product.updateMany({ "choose": ch }, { $pull: { "choose": ch } });
        console.log(result);
        res.redirect('/admin');
    } catch (error) {
        console.log(error);
    }
}


exports.deleOrder = async (req, res, next) => {
    try {
        console.log(req.body);
        var UserOrderm = await user.findOne({ "_id": req.body.uID }).populate("orders.products.product_id");
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
        console.log(error);
    }
}
