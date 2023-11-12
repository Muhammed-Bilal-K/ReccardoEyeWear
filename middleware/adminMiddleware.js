

const notlogged = (req, res, next) => {
    try {
        if (req.session.adminData) {
            res.redirect('/admin')
        } else {
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}
const loggedIn = (req, res, next) => {
    try {
        if (req.session.adminData) {
            next()
        } else {
            res.redirect('/admin/login');
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loggedIn,
    notlogged,
}