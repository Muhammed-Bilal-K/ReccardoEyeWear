var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController');
var cartController = require('../controllers/cartController');



/* GET user' homepage listing. */
router.get('/', userController.homepage);

/* GET user's loginpage listing. */
router.get('/login', userController.loginpage);

/* GET user's signuppage listing. */
router.get('/signup', userController.signuppage);

/* GET user' homepage listing. */
router.get('/product-category/women', userController.womencate);

/* GET user' homepage listing. */
router.get('/product-category/men', userController.mencate);

/* GET user' homepage listing. */
router.get('/product-category/women/view/:id', userController.eachProductv);

/* GET user' homepage listing. */
router.get('/cart', cartController.cart);

/* GET user' homepage listing. */
router.get('/cart/procesCheck', cartController.orderProceed);

/* GET user' homepage listing. */
router.get('/settings', cartController.userAdd);

/* GET user' homepage listing. */
router.get('/settings/addrs', cartController.specicAdd);

/* GET user' homepage listing. */
router.get('/settings/addrs/n1', cartController.newuserAdd);

/* GET user' homepage listing. */
router.get('/settings/orders', cartController.listOrder);

/* GET user' homepage listing. */
router.get('/logout', userController.userlogout);


////////////////////////////////////////////////////////////////////////////////////


/* POST user's signuppage listing. */
router.post('/signup/verification', userController.createsignuppage);

/* POST user's signuppage listing. */
router.post('/otp', userController.otpverifiypage);

/* POST user's loginppage listing. */
router.post('/login', userController.createloginpage);

/* POST user's loginppage listing. */
router.post('/addToCart/:id', cartController.addTocarts);

router.post('/change-product-q', cartController.changeQUA);

router.post('/user/addNew', userController.newAddress);

module.exports = router;
