let user = require('../models/usersdb');
let product = require('../models/productdb');
let category = require('../models/categorydb');
let coupen = require('../models/coupondb');
let createCsvWriter = require('csv-writer').createObjectCsvWriter;
let path = require('path');
let fs = require('fs');
let pdfkit = require('pdfkit');

const admin = {
    email: 'a@m',
    password: '123'
}

function getYearWeek(date) {
    const year = date.getFullYear();
    const weekNumber = getISOWeek(date);
    return `${year}-W${weekNumber}`;
}

// Function to get the ISO week number of a date
function getISOWeek(date) {
    const target = new Date(date.valueOf());
    const dayNumber = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNumber + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000
}

exports.adminpage = async (req, res) => {
    try {
        let formattedMonthlySales = [];
        const usersData = await user.find().sort({ createdAt: 1 });

        const paymentMethodsCount = await user.aggregate([
            {
                $unwind: '$orders',
            },
            {
                $group: {
                    _id: '$orders.paymentmethod',
                    count: { $sum: 1 },
                },
            },
        ]);

        const monthlySales = await user.aggregate([
            {
                $unwind: '$orders',
            },
            {
                $project: {
                    month: { $month: '$orders.created_at' },
                    year: { $year: '$orders.created_at' },
                    totalamount: '$orders.totalamount',
                },
            },
            {
                $group: {
                    _id: { month: '$month', year: '$year' },
                    totalSales: { $sum: '$totalamount' },
                },
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 },
            },
        ]);

        const chartData = {
            labels: [],
            data: [],
        };

        const chartDataM = {
            labels: [],
            data: [],
        };

        const chartDataY = {
            labels: [],
            data: [],
        };

        usersData.forEach((user) => {
            const formattedMonth = user.created_at.toISOString().split('-').slice(0, 2).join('-');

            if (!chartDataY.labels.includes(formattedMonth)) {
                chartDataY.labels.push(formattedMonth);
                chartDataY.data.push(1);
            } else {
                const index = chartDataY.labels.indexOf(formattedMonth);
                chartDataY.data[index]++;
            }
        });

        const weekMap = new Map();

        usersData.forEach((user) => {
            const yearWeek = getYearWeek(user.created_at);

            if (!weekMap.has(yearWeek)) {
                weekMap.set(yearWeek, 1);
            } else {
                weekMap.set(yearWeek, weekMap.get(yearWeek) + 1);
            }
        });

        weekMap.forEach((value, key) => {
            chartDataM.labels.push(key);
            chartDataM.data.push(value);
        });


        usersData.forEach((user) => {
            const formattedDate = user.created_at.toISOString().split('T')[0];

            if (!chartData.labels.includes(formattedDate)) {
                chartData.labels.push(formattedDate);
                chartData.data.push(1);

                if (chartData.labels.length > 7) {
                    chartData.labels.shift();
                    chartData.data.shift();
                }
            } else {
                const index = chartData.labels.indexOf(formattedDate);
                chartData.data[index]++;
            }
        });

        const newEntry = monthlySales.map((result) => ({
            month: result._id.month,
            year: result._id.year,
            totalSales: result.totalSales,
        }));

        formattedMonthlySales.unshift(newEntry);

        formattedMonthlySales = formattedMonthlySales.slice(0, 12);

        const amountOfUsers = await user.find({}).count();

        const totalordersCount = await user.aggregate([
            {
            $unwind:"$orders",
            },
            {
                $unwind:"$orders.products"
            },
            {
                $group:{
                    "_id":null,
                    count:{$sum : 1}
                }
            }
        ])

        let totalorders = totalordersCount[0].count;

        res.render('admin/adminPanel', { chartData, chartDataM, chartDataY, formattedMonthlySales, paymentMethodsCount, amountOfUsers , totalorders});
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.Listallproducts = async (req, res) => {
    try {
        await product.find({ unlist: false }).then((result) => {
            category.find({}).then((data) => {
                res.render('admin/adminProductsList', { Allproduct: result, categoryList: data });
            })
        })
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

exports.salesReport = async (req, res) => {

    let userOrders = await user.aggregate([
        {
            $unwind: '$orders'
        },
        {
            $unwind: '$orders.products'
        },
        {
            $lookup: {
                from: 'productdetails', // Assuming your product details collection is named 'productdetails'
                localField: 'orders.products.product_id',
                foreignField: '_id',
                as: 'productDetails'
            }
        },
        {
            $project: {
                _id: 0,
                date: '$orders.created_at',
                orderId: '$orders._id',
                name: '$address.name',
                productName: '$productDetails.name',
                quantity: '$orders.products.qty',
                paymentMethod: '$orders.paymentmethod',
                amount: '$orders.products.price'
            }
        }
    ]);

    res.render('admin/adminSales', { allOrders: userOrders });
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
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.blockUser = async (req, res) => {
    try {
        let email = req.query.email;
        await user.updateOne({ "email": email }, { $set: { is_blocked: 1 } }).then((respo) => {
            res.redirect('/admin/users');
        })
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}


exports.userDetailsE = async (req, res) => {
    try {
        let uid = req.params.id;
        let userSpec = await user.findOne({ "_id": uid });
        res.render('admin/adminUserView', { userSpec: userSpec });
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
        res.render('admin/adminOrdersList', { FULLDATA: cartExist });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}


exports.orderView = async (req, res) => {

    try {
        let id = req.query.id;
        let userOrders = await user.findOne({ "_id": id }).populate('orders.products.product_id');
        res.render('admin/adminEachOrdderView', { FULLDATA: userOrders.orders, Userid: id });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
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

exports.coupenManagement = async (req, res) => {
    try {
        var coupenData = await coupen.find({});
        console.log(coupenData);
        res.render('admin/adminCoupens', { coupenDetails: coupenData });
    } catch (error) {

    }
}

exports.addcoupens = async (req, res) => {
    try {
        res.render('admin/couponsManage');
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.editCoupen = async (req, res) => {
    try {
        let coupenData = await coupen.findOne({ _id: req.query.id });
        res.render('admin/editCoupen', { coupenData: coupenData, CoupenExist: req.session.existingCoupon });
        req.session.existingCoupon = false;
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.deleteCoupen = async (req, res) => {
    try {
        await coupen.deleteOne({ _id: req.query.id });
        res.redirect('/admin/coupens');
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



////////////////////////////  POST  ///////////////////////////////////////////

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

exports.salesReportDownload = async (req, res) => {
    try {
        const salesData = await user.aggregate([
            {
                $unwind: '$orders',
            },
            {
                $unwind: '$orders.products',
            },
            {
                $lookup: {
                    from: 'productdetails',
                    localField: 'orders.products.product_id',
                    foreignField: '_id',
                    as: 'productDetails',
                },
            },
            {
                $project: {
                    _id: 0,
                    date: '$orders.created_at',
                    orderId: '$orders._id',
                    name: '$address.name',
                    productName: '$productDetails.name',
                    quantity: '$orders.products.qty',
                    paymentMethod: '$orders.paymentmethod',
                    amount: '$orders.products.price',
                },
            },
        ]);
        if (req.body.method == 'csv') {
            // Aggregate data from MongoDB

            const csvWriter = createCsvWriter({
                path: 'sales_report.csv',
                header: [
                    { id: 'date', title: 'Date' },
                    { id: 'orderId', title: 'Order ID' },
                    { id: 'name', title: 'Name' },
                    { id: 'productName', title: 'Product Name' },
                    { id: 'quantity', title: 'Quantity' },
                    { id: 'paymentMethod', title: 'Payment Method' },
                    { id: 'amount', title: 'Amount' },
                ],
            });
            csvWriter.writeRecords([{}]).then(() => {
                csvWriter.writeRecords(salesData).then(() => {
                    console.log('CSV file written successfully');
                    res.download('sales_report.csv', 'sales_report.csv', (err) => {
                        if (err) {
                            console.error('Error downloading CSV file:', err);
                            res.status(500).send('Internal Server Error');
                        }
                    });
                });
            });
        } else {
            const pdfDoc = new pdfkit();
            const pdfStream = fs.createWriteStream('sales_report.pdf');

            pdfDoc.pipe(pdfStream);

            pdfDoc.fontSize(12).text('Sales Report', { align: 'center' }).moveDown();

            salesData.forEach((sale) => {
                pdfDoc.fontSize(10).text(`Date: ${sale.date}`, { continued: true });
                pdfDoc.text(`Order ID: ${sale.orderId}`).moveDown();
                pdfDoc.text(`Name: ${sale.name}`).moveDown();
                pdfDoc.text(`Product Name: ${sale.productName}`).moveDown();
                pdfDoc.text(`Quantity: ${sale.quantity}`).moveDown();
                pdfDoc.text(`Payment Method: ${sale.paymentMethod}`).moveDown();
                pdfDoc.text(`Amount: ${sale.amount}`).moveDown();
                pdfDoc.moveDown();
            });

            pdfDoc.end();

            pdfStream.on('finish', () => {
                console.log('PDF file written successfully');
                res.download('sales_report.pdf', 'sales_report.pdf', (err) => {
                    if (err) {
                        console.error('Error downloading PDF file:', err);
                        res.status(500).send('Internal Server Error');
                    }
                });
            });
        }

    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).send('Internal Server Error');
    }
};

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
                res.redirect('/admin/addCategory');
            }
        } else {
            res.render('admin/adminAddCategory', { messsage: 'The category Already Existing' });
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
