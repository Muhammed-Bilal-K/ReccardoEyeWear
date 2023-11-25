let express = require('express');
let router = express.Router();
let adminController = require('../controllers/adminController');
let productController = require('../controllers/productController');
let adminMiddleware = require('../middleware/adminMiddleware');

/* GET user' homepage listing. */
router.get('/', adminMiddleware.loggedIn , adminController.adminpage);
/* GET user' homepage listing. */
router.get('/products', adminMiddleware.loggedIn , adminController.Listallproducts);

/* GET user's loginpage listing. */
router.get('/login', adminMiddleware.notlogged , adminController.loginpage);

router.get('/addPorducts' , adminMiddleware.loggedIn , adminController.addingProducts);

router.get('/addCategory', adminMiddleware.loggedIn , adminController.addCategoryPage);

router.get('/category/delete', adminMiddleware.loggedIn , adminController.deleteCategory);

router.get('/updateProduct/:id', adminMiddleware.loggedIn , adminController.updatenewone);

router.get('/unlistedProduct', adminMiddleware.loggedIn , productController.unlistedProduct);

router.get('/ExistImgDelete', adminMiddleware.loggedIn , adminController.deleteImg)

/* POST user's loginppage listing. */
router.get('/deleteProduct', adminMiddleware.loggedIn , productController.deleteProductImg);

/* POST user's loginppage listing. */
router.get('/users', adminMiddleware.loggedIn , adminController.userSpec);

/* POST user's loginppage listing. */
router.get('/user/view/:id', adminMiddleware.loggedIn , adminController.userDetailsE);

router.get('/unblock', adminMiddleware.loggedIn , adminController.unblockUser);

router.get('/block', adminMiddleware.loggedIn , adminController.blockUser);

/* POST user's loginppage listing. */
router.get('/user/delete/:id', adminMiddleware.loggedIn , adminController.userCompDelet);

/* POST user's loginppage listing. */
router.get('/orders' , adminMiddleware.loggedIn , adminController.orderList);

router.get('/view/order', adminMiddleware.loggedIn , adminController.orderView);

router.get('/order/Status', adminMiddleware.loggedIn , adminController.orderStatus);

router.get('/coupens', adminMiddleware.loggedIn , adminController.coupenManagement);

router.get('/addCoupons', adminMiddleware.loggedIn , adminController.addcoupens);

router.get('/editCoupon' , adminController.editCoupen);

router.get('/deleteCoupon' , adminController.deleteCoupen);

router.get('/logout', adminController.logoutpage)

///////////////////////////////////////////////////////////////////

/* POST user's loginppage listing. */
router.post('/admin/login', adminMiddleware.notlogged , adminController.createAdminlogin);

/* POST user's loginppage listing. */
router.post('/admin/addProducts', adminMiddleware.loggedIn, productController.addaProducts);

router.post('/admin/addCoupen' , adminMiddleware.loggedIn , productController.addcoupens);

router.post('/admin/editCoupen' , adminMiddleware.loggedIn , productController.editCoupen);

/* POST user's loginppage listing. */
router.post('/Productupdate/:id', adminMiddleware.loggedIn, productController.updateNewSpecific);

router.get('/unlist',  adminMiddleware.loggedIn, productController.unlistProduct);

router.get('/list',  adminMiddleware.loggedIn, productController.listProduct)

/* POST user's loginppage listing. */
router.post('/updateUser/:id', adminMiddleware.loggedIn, adminController.userUpdateDetail);

/* POST user's loginppage listing. */
router.post('/admin/addCategory',  adminMiddleware.loggedIn, adminController.addCategory);

/* POST user's loginppage listing. */
router.post('/deletecat', adminController.deleteCa);

/* POST user's loginppage listing. */
router.post('/admin/dorder',  adminMiddleware.loggedIn, adminController.deleOrder);








module.exports = router;
