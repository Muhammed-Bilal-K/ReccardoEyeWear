var user = require('../models/usersdb');
var product = require('../models/productdb');
var nodemailer = require('nodemailer');
var otpverifymake = null;
var emailOtpCheck = null;


const sendVerifyMail = async (name, email, user_id) => {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000);
        otpverifymake = otp;
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.Email,
                pass: process.env.Pass,
            },
        });
        const mailOptions = {
            from: process.env.Email,
            to: email,
            subject: 'Your OTP Code',
            html: `<p>Hey ${name} Here is your Verification OTP: <br> Your OTP is <b>${otp}</b> </p><br>
                    <i>Otp will Expire in 1 Minute</i>`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    } catch (error) {
        console.log(error);
    }
}

exports.otpverifiypage = async (req, res) => {
    var veriOtp = req.body.otp;
    try {
        if (otpverifymake == veriOtp) {
            var UpdatedDataDetail = await user.updateOne({ email: emailOtpCheck }, { $set: { is_verified: 1 } });
            otpverify = null;
            emailOtpCheck = null;
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error);
    }
};

exports.homepage = async (req, res) => {
    try {
        res.render('home', { logCheck: req.session.userData });
    } catch (error) {
        console.log('error in user home product');
    }
}

exports.womencate = async (req, res) => {
    try {
        //var productDeatil = await product.find({ "choose": "women" });

        var search = '';
            if (req.query.search) {
                search = req.query.search;
            }
            
            var AllProduct = await product.find({
                "choose":"women",
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
            });
        res.render('women', { productDeatil: AllProduct });
    } catch (error) {
        console.log(error);
    }
}

exports.mencate = async (req, res) => {
    try {
        // var productDeatil = await product.find({ "choose": "men" });

            var search = '';
            if (req.query.search) {
                search = req.query.search;
            }
            
            var AllProduct = await product.find({
                "choose":"men",
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
            });

        res.render('men', { productDeatil: AllProduct });
    } catch (error) {
        console.log(error);
    }
}


exports.loginpage = async (req, res) => {
    try {
        req.session.signupErr = false;
        req.session.signupPassErr = false
        if (req.session.userData) {
            res.redirect('/');
        } else {
            req.session.otpVerify = false;
            res.render('login', { errMSG: req.session.loginErr, is_veri: req.session.is_verified, is_block: req.session.is_blocked });
        }
    } catch (error) {
        console.log(error);
    }
}

exports.signuppage = async (req, res) => {
    try {
        req.session.is_verified = false;
        req.session.is_blocked = false;
        req.session.loginErr = false;
        if (req.session.userData) {
            res.redirect('/');
        } else {
            res.render('signup', { SignMSR: req.session.signupErr, passNotmatch: req.session.signupPassErr });
        }
    } catch (error) {
        console.log(error);
    }
}


exports.eachProductv = async (req, res) => {
    try {
        var uid = req.params.id;
        var EachproductDeatil = await product.findOne({ "_id": uid });
        res.render('eachProductV', { EachproductDeatil: EachproductDeatil });
    } catch (error) {
        console.log(error);
    }
}

exports.userlogout = async (req, res) => {
    try {
        req.session.destroy(() => {
            res.redirect('/login');
        })
    } catch (error) {
        console.log(error);
    }
}

exports.updateUseradd = async (req, res) => {
    var userId = req.session.userData;
    var updateId = req.params.id;
    try {
        var UserAddss = await user.findOne({ "_id": userId });
        var addsList = UserAddss.address.find(data => data._id.toString() === updateId);
        res.render('updateAdduser', { addlist: addsList });
    } catch (error) {
        console.log(error);
    }
}

//<-----------------------------------------POST METHODS--------------------------------------------->//



exports.createsignuppage = async (req, res) => {
    try {
        const { email } = req.body;
        var ExistEmail = await user.findOne({ email: email });
        if (ExistEmail) {
            req.session.signupErr = true;
            return res.redirect('/signup');
        }
        p = req.body.password;
        cp = req.body.c_password;
        if (p != cp) {
            req.session.signupPassErr = true;
            return res.redirect('/signup');
        }

        emailOtpCheck = req.body.email;

        const userDetail = new user({
            name: req.body.name,
            email: req.body.email,
            p_number: req.body.p_number,
            password: req.body.password,
        });
        await userDetail.save();

        if (userDetail) {
            sendVerifyMail(req.body.name, req.body.email, userDetail._id);
            req.session.otpVerify = true;
            req.session.signup = true;
            if (req.session.otpVerify) {
                res.render('otp');
            }
        }

    } catch (error) {
        console.log('error signup');
    }
}

// sendVerifyMail(req.body.name, req.body.email, userDetail._id);


exports.createloginpage = async (req, res) => {
    var cheEma = req.body.email;
    try {
        var loginVerify = await user.findOne({ "email": cheEma });

        if (!loginVerify) {
            req.session.loginErr = true;
            return res.redirect('/login');
        }

        if (loginVerify.is_blocked === 1) {
            req.session.is_blocked = true;
            return res.redirect('/login');
        }

        if (loginVerify.is_verified != 1) {
            req.session.is_verified = true;
            res.redirect('/login');
        } else if ((loginVerify.email === req.body.email && loginVerify.password === req.body.password)) {
            req.session.login = true;
            req.session.userData = loginVerify._id;
            res.redirect('/');
        }
    } catch (error) {
        console.log(error);
    }
}


exports.newAddress = async (req, res) => {
    var userId = req.session.userData;
    var UserAddss = await user.findOne({ "_id": userId });
    try {
        if (UserAddss) {
            await user.updateOne({ "_id": userId }, {
                $push: {
                    "address": {
                        name: req.body.name,
                        email: req.body.email,
                        select: req.body.select,
                        address: req.body.address,
                        city: req.body.city,
                        state: req.body.state,
                        zipcode: req.body.zipcode
                    }
                }
            })
            res.redirect('/settings/addrs');
        }
    } catch (error) {
        console.log(error);
    }
}


exports.updateAdds = async (req, res) => {
    var userId = req.session.userData;
    var pid = req.params.id;
    console.log(pid);
    console.log(req.body);
    var UserAddss = await user.findOne({ "_id": userId });
    var addsList = UserAddss.address.find(data => data._id.toString() === pid);
    if (addsList) {
        await user.updateOne({ "_id": userId, "address._id": pid }, {
            $set: {
                'address.$.name': req.body.name,
                'address.$.email': req.body.email,
                'address.$.select': req.body.select,
                'address.$.address': req.body.address,
                'address.$.city': req.body.city,
                'address.$.state': req.body.state,
                'address.$.zipcode': req.body.zipcode,
            }
        })
        console.log('success');
    } else {
        console.log(error);
    }
}


exports.deleteAdds = async (req, res) => {
    var userId = req.session.userData;
    var addID = req.params.id;
    var UserAddss = await user.findOne({ "_id": userId });
    var addsList = UserAddss.address.find(data => data._id.toString() === addID);
    if (addsList) {
        var result = await user.updateOne({ "_id": userId }, { $pull: { "address": { "_id": addID } } });
        console.log(result);
    }
}



// sendVerifyMail(req.body.name, req.body.email, userDetail._id);







// await userDetail.save();

// const transporter = nodemailer.createTransport({
//     service: 'Gmail',
//     auth: {
//         user: 'bilalcr7juv@gmail.com',
//         pass: '',
//     },
// });

// const mailOptions = {
//     from: 'bilalcr7juv@gmail.com',
//     to: email,
//     subject: 'Your OTP Code',
//     html:'<p>Hi '+name+', please verify your email <a href="http://localhost:4000/verify?id='+user_id+'"> click </a>.</p>'
// };

// transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//         console.log(error);
//     } else {
//         console.log('Email sent: ' + info.response);
//     }
// });