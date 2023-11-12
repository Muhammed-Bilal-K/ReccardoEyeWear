const users = require('../models/usersdb');

const loggedIn = async (req, res, next) => {
    if (req.session.userData) {
        try {
            let Uid = req.session.userData;
            let userDetails = await users.findOne({ "_id": Uid });
            req.userDetails = userDetails;
            if(userDetails.is_blocked === 1){
                req.session.destroy((err) => {
                    console.log(err);
                    res.status(500)
                })
                res.clearCookie('connect.sid');
                res.redirect('/login');
            }
            next();
        } catch (error) {
            console.log(error);
            return res.status(500).send('MiddleWare Error');
        }
    } else {
        return res.redirect('/login');
    }
}

const notLogged = (req, res, next) => {
    req.session.signupErr = false;
    req.session.signupPassErr = false;
    if (req.session.userData) {
        return res.redirect('/');
    }
    req.session.otpVerify = false;
    next()
}

module.exports = {loggedIn , notLogged};