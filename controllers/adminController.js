let user = require('../models/usersdb');
let product = require('../models/productdb');
let category = require('../models/categorydb');
let path = require('path');
let fs = require('fs');

const admin = {
    email: 'a@m',
    password: '123'
}

exports.adminpage = async (req, res) => {
    try {
        // var search = '';
        // var limit = 4;
        // var page = 1;
        // if (req.query.search) {
        //     search = req.query.search;
        // }

        // if (req.query.page) {
        //     page = req.query.page;
        // }

        // var AllProduct = await product.find({
        //     $expr: { $ne: [{ $size: "$choose" }, 0] },
        //     $or: [
        //         {
        //             name: {
        //                 $regex: '.*' + search + '.*',
        //                 $options: 'i'
        //             }
        //         },
        //         {
        //             price: {
        //                 $regex: '.*' + search + '.*',
        //                 $options: 'i'
        //             }
        //         }
        //     ]
        // }).limit(limit * 1).skip((page - 1) * limit);

        // var count = await product.find({
        //     $or: [
        //         {
        //             name: {
        //                 $regex: '.*' + search + '.*',
        //                 $options: 'i'
        //             }
        //         },
        //         {
        //             price: {
        //                 $regex: '.*' + search + '.*',
        //                 $options: 'i'
        //             }
        //         }
        //     ]
        // }).countDocuments();

        // var totalcos = await user.find({ "is_verified": 1 }).count();
        res.render('admin/adminPanel', {
            // ProductDoc: AllProduct,
            // totalcos,
            // totalpage: 4
            // currentPage: page,
            // search
        });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.Listallproducts = async (req, res) => {
    await product.find({ unlist: false }).then((result) => {
        category.find({}).then((data) => {
            res.render('admin/adminProductsList', { Allproduct: result, categoryList: data });
        })
    })
}

exports.loginpage = async (req, res) => {
    try {
        res.render('adminlogin');
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.addingProducts = async (req, res) => {
    try {
        await category.find({}).then((CategoryData) => {
            res.render('admin/adminAddProducts', { CategoryList: CategoryData });
        })
        // let categ = await product.find({}).distinct("choose");
        // res.render('addone', { categ: categ });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.addCategoryPage = async (req, res) => {
    try {
        res.render('admin/adminAddCategory');
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.deleteCategory = async (req, res) => {
    try {
        let categoryData = req.query.name;
        await category.deleteOne({ name: categoryData }).then(() => {
            res.redirect('/admin/products');
        })
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.updatenewone = async (req, res) => {
    try {
        let id = req.params.id;
        let formattedId = id.replace(/%20/g, '');
        let EachProduct = await product.findOne({ "_id": formattedId });
        console.log(EachProduct);
        res.render('admin/adminUpdateProdts', { SpecificProduct: EachProduct });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.userSpec = async (req, res) => {
    try {
        let alluser = await user.find({});
        res.render('admin/adminUsersList', { allUser: alluser });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}


exports.unblockUser = async (req, res) => {
    try {
        let email = req.query.email;
        await user.updateOne({ "email": email }, { $set: { is_blocked: 0 } }).then((respo) => {
            res.redirect('/admin/users');
        })
    } catch (error) {
        console.log(error);
    }
}

exports.blockUser = async (req, res) => {
    try {
        let email = req.query.email;
        await user.updateOne({ "email": email }, { $set: { is_blocked: 1 } }).then((respo) => {
            res.redirect('/admin/users');
        })
    } catch (error) {
        console.log(error);
    }
}


exports.userDetailsE = async (req, res) => {
    try {
        let uid = req.params.id;
        let userSpec = await user.find({ "_id": uid });
        // if (userSpec.is_blocked === 0) {
        //     var access = 'unblock';
        // } else {
        //     var access = 'block';
        // }
        console.log(userSpec);
        // res.render('adminuserDetail', { userSpec: userSpec, access: access });
        res.render('adminuserDetail');
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
        let userOrders = await user.find({}).populate('orders.products.product_id');
        let cartExist = userOrders.filter((data) => {
            return data.orders.length != 0;
        })
        console.log(cartExist);
        res.render('admin/adminOrdersList', { FULLDATA: cartExist });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}


exports.orderView = async (req, res) => {
    let id = req.query.id;
    let userOrders = await user.findOne({ "_id": id }).populate('orders.products.product_id');
    res.render('admin/adminEachOrdderView', { FULLDATA: userOrders.orders, Userid: id });
}

exports.orderStatus = async (req, res) => {
    try {
        let userid = req.query.userid;
        let proid = req.query.proid;
        let orderid = req.query.orderid;
        let userData = await user.findOne({ "_id": userid }).populate('orders.products.product_id');
        let result = userData.orders.find((data) => data._id == orderid);
        let statusData = result.products.find((datas) => datas._id == proid);
        if (statusData.status == 'pending') {
            statusData.status = 'Delivered'
        }
        await userData.save();
        res.redirect(`/admin/view/order?id=${userid}`);
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.deleteImg = async (req, res) => {
    try {
        let id = req.query.id;
        let img = req.query.img;
        const result = await product.updateOne({ _id: id }, { $pull: { image: img } });
        if (result) {
            const imagePath = path.join(__dirname, '..', 'public', 'uploaded', img);
            fs.unlink(imagePath, (unlinkError) => {
                if (unlinkError) {
                    res.status(500).json({ message: 'Error deleting image.' });
                } else {
                    res.redirect('/admin');
                }
            });
        } else {
            console.log(' in img error');
        }
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

exports.addCategory = async (req, res) => {
    try {
        let CategoryData = req.body.category;
        CategoryData = CategoryData.toLowerCase();
        let ExistCategory = await category.findOne({ name: { $regex: new RegExp(`^${CategoryData}$`, "i") } });
        if (!ExistCategory) {
            let categoryDetail = new category({
                name: CategoryData,
            });
            let resultData = await categoryDetail.save();
            if (resultData) {
                res.redirect('/admin');
            }
        } else {
            res.redirect('/admin/products');
        }
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
