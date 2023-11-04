var express = require('express');
var router = express.Router();
var adminController = require('../controllers/adminController');
var productController = require('../controllers/productController');

/* GET user' homepage listing. */
router.get('/', adminController.adminpage);

/* GET user's loginpage listing. */
router.get('/login', adminController.loginpage);

router.get('/addnew', adminController.addnewone);

router.get('/categU', adminController.catUp);

router.get('/updateone/:id', adminController.updatenewone);

/* POST user's loginppage listing. */
router.get('/deleteone/:id', productController.deleteOneSpec);

/* POST user's loginppage listing. */
router.get('/user', adminController.userSpec);

/* POST user's loginppage listing. */
router.get('/user/view/:id', adminController.userDetailsE);

/* POST user's loginppage listing. */
router.get('/user/delete/:id', adminController.userCompDelet);

router.get('/logout', adminController.logoutpage)

///////////////////////////////////////////////////////////////////

/* POST user's loginppage listing. */
router.post('/admin/login', adminController.createAdminlogin);

/* POST user's loginppage listing. */
router.post('/admin/addonenew', productController.createNewOne);

/* POST user's loginppage listing. */
router.post('/updateNewone/:id', productController.updateNewSpecific);

/* POST user's loginppage listing. */
router.post('/updateUser/:id', adminController.userUpdateDetail);

/* POST user's loginppage listing. */
router.post('/deletecat', adminController.deleteCa);








module.exports = router;
