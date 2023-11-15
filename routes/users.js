let express = require('express');
let router = express.Router();
let userController = require('../controllers/userController');
let cartController = require('../controllers/cartController');
let userMiddleware = require('../middleware/userMiddleware');


/* GET user' homepage listing. */
router.get('/', userController.homepage);

/* GET user's loginpage listing. */
router.get('/login', userMiddleware.notLogged , userController.loginpage);

/* GET user's signuppage listing. */
router.get('/signup', userMiddleware.notLogged , userController.signuppage);

/* GET user' homepage listing. */
router.get('/product-category/women', userController.womencate);

/* GET user' homepage listing. */
router.get('/product-category/men', userController.mencate);

/* GET user' homepage listing. */
router.get('/product-category/women/view/:id', userMiddleware.loggedIn , userController.eachProductv);

/* GET user' homepage listing. */
router.get('/cart', userMiddleware.loggedIn , cartController.cart);

/* GET user' homepage listing. */
router.get('/cart/procesCheck', userMiddleware.loggedIn , cartController.orderProceed);

/* GET user' homepage listing. */
router.get('/settings', userMiddleware.loggedIn , cartController.userAdd);

/* GET user' homepage listing. */
router.get('/settings/addrs', userMiddleware.loggedIn , cartController.specicAdd);

/* GET user' homepage listing. */
router.get('/settings/addrs/n1', userMiddleware.loggedIn , cartController.newuserAdd);

/* GET user' homepage listing. */
router.get('/settings/orders', userMiddleware.loggedIn , cartController.listOrder);

/* GET user' homepage listing. */
router.get('/settings/orders/view/:id', userMiddleware.loggedIn , cartController.viewEach);

/* GET user' homepage listing. */
router.get('/settings/useradd/update/:id', userMiddleware.loggedIn , userController.updateUseradd);

/* GET user' homepage listing. :id*/
router.get('/settings/useradd/delete/:id', userMiddleware.loggedIn , userController.deleteAdds);

/* GET user' homepage listing. */
router.get('/logout', userController.userlogout);


////////////////////////////////////////////////////////////////////////////////////


/* POST user's signuppage listing. */
router.post('/signup/verification' , userController.createsignuppage);

/* POST user's signuppage listing. */
router.post('/otp', userController.otpverifiypage);

router.post('/resendOtp', userController.otpResend);

/* POST user's loginppage listing. */
router.post('/login',userMiddleware.notLogged , userController.createloginpage);

/* POST user's loginppage listing. */
router.post('/addToCart/:id', userMiddleware.loggedIn, cartController.addTocarts);

router.post('/change-product-q', userMiddleware.loggedIn, cartController.changeQUA);

router.post('/user/addNew', userMiddleware.loggedIn, userController.newAddress);

router.post('/user/addNew/:id', userMiddleware.loggedIn, userController.updateAdds);

router.post('/cart/delete/:id', userController.deleteCartItem);

router.post('/getAdd', cartController.processDelivery)

module.exports = router;
