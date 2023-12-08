let express = require('express');
let router = express.Router();
let adminController = require('../controllers/adminController');
let productController = require('../controllers/productController');
let adminMiddleware = require('../middleware/adminMiddleware');


router.get('/', adminMiddleware.loggedIn , adminController.adminpage);

router.get('/login', adminMiddleware.notlogged , adminController.loginpage);

router.get('/salesReport', adminMiddleware.loggedIn , adminController.salesReport);

router.get('/products', adminMiddleware.loggedIn , adminController.Listallproducts);

router.get('/addPorducts' , adminMiddleware.loggedIn , adminController.addingProducts);

router.get('/addCategory', adminMiddleware.loggedIn , adminController.addCategoryPage);

router.get('/category/delete', adminMiddleware.loggedIn , adminController.deleteCategory);

router.get('/updateProduct/:id', adminMiddleware.loggedIn , adminController.updatenewone);

router.get('/unlistedProduct', adminMiddleware.loggedIn , productController.unlistedProduct);

router.get('/ExistImgDelete', adminMiddleware.loggedIn , adminController.deleteImg)

router.get('/deleteProduct', adminMiddleware.loggedIn , productController.deleteProductImg);

router.get('/users', adminMiddleware.loggedIn , adminController.userSpec);

router.get('/user/view/:id', adminMiddleware.loggedIn , adminController.userDetailsE);

router.get('/unblock', adminMiddleware.loggedIn , adminController.unblockUser);

router.get('/block', adminMiddleware.loggedIn , adminController.blockUser);

router.get('/user/delete/:id', adminMiddleware.loggedIn , adminController.userCompDelet);

router.get('/orders' , adminMiddleware.loggedIn , adminController.orderList);

router.get('/view/order', adminMiddleware.loggedIn , adminController.orderView);

router.get('/order/Status', adminMiddleware.loggedIn , adminController.orderStatus);

router.get('/coupens', adminMiddleware.loggedIn , adminController.coupenManagement);

router.get('/addCoupons', adminMiddleware.loggedIn , adminController.addcoupens);

router.get('/editCoupon' , adminController.editCoupen);

router.get('/deleteCoupon' , adminController.deleteCoupen);

router.get('/logout', adminController.logoutpage)

///////////////////////////////////////////////////////////////////

router.post('/admin/login', adminMiddleware.notlogged , adminController.createAdminlogin);

router.post('/admin/sales-report/download-report', adminController.salesReportDownload)

router.post('/admin/addProducts', adminMiddleware.loggedIn, productController.addaProducts);

router.post('/admin/addCoupen' , adminMiddleware.loggedIn , productController.addcoupens);

router.post('/admin/editCoupen' , adminMiddleware.loggedIn , productController.editCoupen);

router.post('/Productupdate/:id', adminMiddleware.loggedIn, productController.updateNewSpecific);

router.get('/unlist',  adminMiddleware.loggedIn, productController.unlistProduct);

router.get('/list',  adminMiddleware.loggedIn, productController.listProduct)

router.post('/updateUser/:id', adminMiddleware.loggedIn, adminController.userUpdateDetail);

router.post('/admin/addCategory',  adminMiddleware.loggedIn, adminController.addCategory);

router.post('/deletecat', adminController.deleteCa);

router.post('/admin/dorder',  adminMiddleware.loggedIn, adminController.deleOrder);


module.exports = router;
