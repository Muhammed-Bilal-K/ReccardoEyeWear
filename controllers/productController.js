let product = require('../models/productdb');
let coupen = require('../models/coupondb');
let fs = require('fs').promises;
let path = require('path');
let sharp = require('sharp');

function generateRandomName() {
    try {
        const letters = 'abcdefgh';
        let randomName = '';
        for (let i = 0; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * letters.length);
            randomName += letters.charAt(randomIndex);
        }
        return randomName;
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.unlistedProduct = async (req, res) => {
    try {
        await product.find({ unlist: true }).then((respo) => {
            res.render('admin/adminUnlistProduct', { Allproduct: respo });
        })
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.addaProducts = async (req, res) => {
    try {
        console.log(req.body);
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files were uploaded.' });
        }
        ImageUpload = req.files.image;
        let img = [];
        if (Array.isArray(ImageUpload)) {
            ImageUpload.forEach(file => {
                let randomName = generateRandomName();
                let newImageName = randomName;
                let uploadPath = require('path').resolve('./') + '/public/uploaded/' + newImageName;
                let croppedImages = require('path').resolve('./') + '/public/uploaded/croppedImage' + newImageName;
                sharp(file.data).resize(450, 450).toFile(croppedImages);
                file.mv(uploadPath, (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error uploading files.' });
                    }
                    console.log('done');
                });
                img.push(newImageName);
            });
        } else {
            let randomName = generateRandomName();
            let newImageName = randomName;
            let uploadPath = require('path').resolve('./') + '/public/uploaded/' + newImageName;
            let croppedImages = require('path').resolve('./') + '/public/uploaded/croppedImage' + newImageName;
            await sharp(ImageUpload).resize(300, 300).toFile(croppedImages);
            ImageUpload.mv(uploadPath, err => {
                if (err) {
                    return res.status(500).json({ message: 'Error uploading file.' });
                }
            });
            img.push(newImageName);
        }
        const productDetail = new product({
            name: req.body.pname,
            qnumber: parseInt(req.body.pquantity),
            price: parseInt(req.body.pprice),
            category: req.body.pcategory,
            description: req.body.pdescription,
            image: img,
        });
        await productDetail.save();
        res.redirect('/admin/products');
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.addcoupens = async (req, res) => {
    try {
        console.log(req.body);
        const expiryDate = new Date(req.body.expiryDate);
        if(expiryDate < Date.now())
        {
            return res.json({expiryDateFaild:true});
        }
        const coupenDetail = new coupen({
            couponname: req.body.couponName,
            couponcode: req.body.couponCode,
            discountamount: req.body.discount,
            mincartamount: req.body.minPrice,
            maxcartamount: req.body.maxPrice,
            expired: req.body.expiryDate,
        });
        await coupenDetail.save();
        if (coupenDetail) {
            res.json({CoupenVerified:true , redirect : '/admin/coupens'});
            // res.redirect('/admin/coupens');
        }
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.editCoupen = async (req, res) => {
    try {
        if (req.body.expiryDate == '') {
            
            await coupen.updateOne({ "_id": req.body.id }, {
                $set: {
                    couponname: req.body.couponName,
                    couponcode: req.body.couponCode,
                    discountamount: req.body.discount,
                    mincartamount: req.body.ordersAbove,
                    maxcartamount: req.body.maxPrice,
                }
            });
        } else {
            await coupen.updateOne({ "_id": req.body.id }, {
                $set: {
                    couponname: req.body.couponName,
                    couponcode: req.body.couponCode,
                    discountamount: req.body.discount,
                    mincartamount: req.body.ordersAbove,
                    maxcartamount: req.body.maxPrice,
                    expired: req.body.expiryDate,
                }
            });
        }
        res.redirect('/admin/coupens');
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}


exports.updateNewSpecific = async (req, res) => {
    try {
        let id = req.params.id;
        let formattedId = id.replace(/%20/g, '');
        if (req.files) {
            const ImageUpload = req.files.image;
            let img = [];
            if (Array.isArray(ImageUpload)) {
                ImageUpload.forEach(file => {
                    const randomName = generateRandomName();
                    const newImageName = randomName;
                    const uploadPath = require('path').resolve('./') + '/public/uploaded/' + newImageName;
                    file.mv(uploadPath, (err) => {
                        if (err) {
                            return res.status(500).json({ message: 'Error uploading files.' });
                        }
                    });
                    img.push(newImageName);
                });
            } else {
                const randomName = generateRandomName();
                const newImageName = randomName;
                const uploadPath = require('path').resolve('./') + '/public/uploaded/' + newImageName;
                ImageUpload.mv(uploadPath, err => {
                    if (err) {
                        return res.status(500).json({ message: 'Error uploading file.' });
                    }
                });
                img.push(newImageName);
            }
            await product.updateOne(
                { "_id": formattedId },
                {
                    $set: {
                        name: req.body.pname,
                        qnumber: parseInt(req.body.pquantity),
                        price: parseInt(req.body.pprice),
                        category: req.body.pcategory,
                        description: req.body.pdescription,

                    }, $push: {
                        image: { $each: img }
                    }
                },

            );
        } else {
            await product.updateOne({ "_id": formattedId }, {
                $set: {
                    name: req.body.pname,
                    qnumber: parseInt(req.body.pquantity),
                    price: req.body.pprice,
                    category: req.body.pcategory,
                    description: req.body.pdescription,
                }
            })
        }
        res.redirect('/admin/products');
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.deleteProductImg = async (req, res) => {
    let id = req.query.id;
    try {
        const result = await product.deleteOne({ _id: id });
        if (result) {
            res.redirect('/admin');
        } else {
            res.status(404).send('Product not found.');
        }
    } catch (error) {
        console.log('Error in deletePart:', error);
        res.status(500).send(error.message);
    }
};


exports.unlistProduct = async (req, res) => {
    let id = req.query.id;
    try {
        await product.updateOne({ "_id": id }, { $set: { unlist: true } }).then(() => {
            res.redirect('/admin/unlistedProduct');
        })
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

exports.listProduct = async (req, res) => {
    let id = req.query.id;
    try {
        await product.updateOne({ "_id": id }, { $set: { unlist: false } }).then(() => {
            res.redirect('/admin/products');
        });
    } catch (error) {
        const statusCode = error.status || 500;
        res.status(statusCode).send(error.message);
    }
}

