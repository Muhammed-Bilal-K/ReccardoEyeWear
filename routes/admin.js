let express = require('express');
let router = express.Router();
let adminController = require('../controllers/adminController');
let productController = require('../controllers/productController');
let adminMiddleware = require('../middleware/adminMiddleware');

/* GET user' homepage listing. */
router.get('/', adminMiddleware.loggedIn , adminController.adminpage);

/* GET user's loginpage listing. */
router.get('/login', adminMiddleware.notlogged , adminController.loginpage);

router.get('/addnew', adminMiddleware.loggedIn , adminController.addnewone);

router.get('/categU', adminMiddleware.loggedIn , adminController.catUp);

router.get('/updateone/:id', adminMiddleware.loggedIn , adminController.updatenewone);

/* POST user's loginppage listing. */
router.get('/deleteone/:id', adminMiddleware.loggedIn , productController.deleteOneSpec);

/* POST user's loginppage listing. */
router.get('/user', adminMiddleware.loggedIn , adminController.userSpec);

/* POST user's loginppage listing. */
router.get('/user/view/:id', adminMiddleware.loggedIn , adminController.userDetailsE);

/* POST user's loginppage listing. */
router.get('/user/delete/:id', adminMiddleware.loggedIn , adminController.userCompDelet);

/* POST user's loginppage listing. */
router.get('/orders', adminMiddleware.loggedIn , adminController.orderList);

router.get('/logout', adminController.logoutpage)

///////////////////////////////////////////////////////////////////

/* POST user's loginppage listing. */
router.post('/admin/login', adminMiddleware.notlogged , adminController.createAdminlogin);

/* POST user's loginppage listing. */
router.post('/admin/addonenew', adminMiddleware.loggedIn, productController.createNewOne);

/* POST user's loginppage listing. */
router.post('/updateNewone/:id', adminMiddleware.loggedIn, productController.updateNewSpecific);

/* POST user's loginppage listing. */
router.post('/updateUser/:id', adminMiddleware.loggedIn, adminController.userUpdateDetail);

/* POST user's loginppage listing. */
router.post('/deletecat', adminController.deleteCa);

/* POST user's loginppage listing. */
router.post('/admin/dorder', adminController.deleOrder);








module.exports = router;
