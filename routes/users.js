let express = require('express');
let router = express.Router();
let userController = require('../controllers/userController');
let cartController = require('../controllers/cartController');
let userMiddleware = require('../middleware/userMiddleware');


router.get('/', userController.homepage);

router.get('/login', userMiddleware.notLogged , userController.loginpage);

router.get('/signup', userMiddleware.notLogged , userController.signuppage);

router.get('/product-category/women', userController.womencate);

router.get('/product-category/men', userController.mencate);

router.get('/product-category', userController.allCategory);

router.get('/forgetpassword', userController.forgetPassword);

router.get('/product-category/women/view/:id', userMiddleware.loggedIn , userController.eachProductv);

router.get('/cart', userMiddleware.loggedIn , cartController.cart);

router.get('/removeitem', userMiddleware.loggedIn, cartController.removeItemWhishlist);

router.get('/favorite', userMiddleware.loggedIn , cartController.favorite);

router.get('/cart/procesCheck', userMiddleware.loggedIn ,  cartController.orderProceed);

router.get('/settings', userMiddleware.loggedIn , cartController.userAdd);

router.get('/settings/addrs', userMiddleware.loggedIn , cartController.specicAdd);

router.get('/settings/addrs/n1', userMiddleware.loggedIn , cartController.newuserAdd);

router.get('/settings/wallet', userMiddleware.loggedIn , userController.wallet);

router.get('/settings/orders', userMiddleware.loggedIn , cartController.listOrder);

router.get('/settings/orders/view/:id', userMiddleware.loggedIn , cartController.viewEach);

router.get('/order/delete', userMiddleware.loggedIn , cartController.DeleteOrder);

router.get('/OrderInvoice/v1/:id', userMiddleware.loggedIn , cartController.downloadPdf);

router.get('/order/return', userMiddleware.loggedIn, cartController.returnProducts);

router.post("/retunringProduct", userMiddleware.loggedIn, cartController.productReturnWithQ)

router.get('/downloadPdf/:id', cartController.downloadData);

router.get('/settings/useradd/update/:id', userMiddleware.loggedIn , userController.updateUseradd);

router.get('/settings/useradd/delete/:id', userMiddleware.loggedIn , userController.deleteAdds);

router.get('/ordersuccess',  userController.successPage);

router.get('/logout', userController.userlogout);


/////////////////////////////////////POST///////////////////////////////////////////////


router.post('/signup/verification' , userController.createsignuppage);

router.post('/otp', userController.otpverifiypage);

router.post('/forgetemailverify', userController.forgetPassChange);

router.post('/passOtpverify', userController.passOtpCheck);

router.post('/setNewPassword', userController.setPassword);

router.post('/resendOtp', userController.otpResend);

router.post('/login',userMiddleware.notLogged , userController.createloginpage);

router.post('/addToCart/:id', userMiddleware.loggedIn , cartController.addTocarts);

router.post('/change-product-q', userMiddleware.loggedIn, cartController.changeQUA);

router.get('/product/favorite/:id', userMiddleware.loggedIn, userController.addAfavorite);

router.post('/user/addNew', userMiddleware.loggedIn, userController.newAddress);

router.post('/user/addNew/:id', userMiddleware.loggedIn, userController.updateAdds);

router.post('/cart/delete/:id', userMiddleware.loggedIn, userController.deleteCartItem);

router.post('/getAdd', userMiddleware.loggedIn, cartController.processDelivery);

router.post('/verify-payment', userMiddleware.loggedIn, cartController.deliveredOnline);

router.post('/coupenCheck', userMiddleware.loggedIn, cartController.coupenApply);


module.exports = router;
