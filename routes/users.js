var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController');



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
router.get('/cart', userController.cart);

/* GET user' homepage listing. */
router.get('/logout', userController.userlogout);


////////////////////////////////////////////////////////////////////////////////////


/* POST user's signuppage listing. */
router.post('/signup/verification', userController.createsignuppage);

/* POST user's signuppage listing. */
router.post('/otp', userController.otpverifiypage);

/* POST user's loginppage listing. */
router.post('/login', userController.createloginpage);

module.exports = router;
