var user = require('../models/usersdb');
var product = require('../models/productdb');
var nodemailer = require('nodemailer');
var otpverifymake = null;
var emailOtpCheck = null;


const sendVerifyMail = async (name, email, user_id) => {
    try {

        const otp = Math.floor(100000 + Math.random() * 900000);
        console.log(otp);

        otpverifymake = otp;

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'bilalcr7juv@gmail.com',
                pass: 'xqrd drrx xmax yymw',
            },
        });

        const mailOptions = {
            from: 'bilalcr7juv@gmail.com',
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
            console.log(`update part ${otpverifymake}`);
            var UpdatedDataDetail = await user.updateOne({ email: emailOtpCheck }, { $set: { is_verified: 1 } });
            console.log(UpdatedDataDetail);
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
        var productDeatil = await product.find({ "choose": "women" });
        console.log(productDeatil);
        res.render('women', { productDeatil: productDeatil });
    } catch (error) {
        console.log(error);
    }
}

exports.mencate = async (req, res) => {
    try {
        var productDeatil = await product.find({ "choose": "men" });
        console.log(productDeatil);
        res.render('men', { productDeatil: productDeatil });
    } catch (error) {
        console.log(error);
    }
}


exports.loginpage = async (req, res) => {
    req.session.signupErr = false;
    req.session.signupPassErr = false
    if (req.session.userData) {
        res.redirect('/');
    } else {
        req.session.otpVerify = false;
        res.render('login', { errMSG: req.session.loginErr, is_veri: req.session.is_verified , is_block:req.session.is_blocked });
    }
}

exports.signuppage = async (req, res) => {
    req.session.is_verified = false;
    req.session.is_blocked = false;
    req.session.loginErr = false;
    if (req.session.userData) {
        res.redirect('/');
    } else {
        res.render('signup', { SignMSR: req.session.signupErr, passNotmatch: req.session.signupPassErr });
    }
}


exports.eachProductv = async (req, res) => {
    try {
        var uid = req.params.id;
        var EachproductDeatil = await product.findOne({ "_id": uid });
        console.log(EachproductDeatil);
        res.render('eachProductV', { EachproductDeatil: EachproductDeatil });
    } catch (error) {
        console.log(error);
    }
}


exports.cart = async (req, res) => {
    try {
        if (req.session.userData) {
            res.send('hi');
        } else {
            res.redirect('/login');
        }
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
    console.log(cheEma);
    try {
        var loginVerify = await user.findOne({ "email": cheEma });
        console.log(loginVerify);

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
            req.session.userData = loginVerify;
            res.redirect('/');
        }
    } catch (error) {
        console.log(error);
    }
}








// let LogCheck = await user.findOne({ email: req.body.email, password: req.body.password });

//         if (!LogCheck) {
//             console.log('fail');
//             req.session.loginErr = true;
//             res.redirect('/login');
//         } else if (LogCheck.email === req.body.email && LogCheck.password === req.body.password) {
//             req.session.login = true;
//             req.session.userData = LogCheck;
//             return res.redirect('/');
//         }



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