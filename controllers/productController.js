let product = require('../models/productdb');
let fs = require('fs').promises;
let path = require('path');

function generateRandomName() {
    const letters = 'abcdefgh';
    let randomName = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        randomName += letters.charAt(randomIndex);
    }
    return randomName;
}

exports.unlistedProduct = async (req, res) => {
    await product.find({ unlist: true }).then((respo) => {
        res.render('admin/adminUnlistProduct', { Allproduct: respo });
    })
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
            price: req.body.pprice,
            category: req.body.pcategory,
            description: req.body.pdescription,
            image: img,
        });
        await productDetail.save();
        res.redirect('/admin');
    } catch (error) {
        console.log(error);
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
                // If multiple images are uploaded, append them to the existing images
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
                // If only one image is uploaded, keep the existing images and add the new one

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
                        price: req.body.pprice,
                        category: req.body.pcategory,
                        description: req.body.pdescription,
                        
                    },$push:{
                        image: { $each: img } 
                    }
                },
    
            );



            // ImageUpload = req.files.image;
            // let img = [];
            // if (Array.isArray(ImageUpload)) {
            //     ImageUpload.forEach(file => {
            //         let randomName = generateRandomName();
            //         let newImageName = randomName;
            //         let uploadPath = require('path').resolve('./') + '/public/uploaded/' + newImageName;
            //         file.mv(uploadPath, (err) => {
            //             if (err) {
            //                 return res.status(500).json({ message: 'Error uploading files.' });
            //             }
            //         });
            //         img.push(newImageName);
            //     });
            // } else {
            //     let randomName = generateRandomName();
            //     let newImageName = randomName;
            //     let uploadPath = require('path').resolve('./') + '/public/uploaded/' + newImageName;
            //     ImageUpload.mv(uploadPath, err => {
            //         if (err) {
            //             return res.status(500).json({ message: 'Error uploading file.' });
            //         }
            //     });
            //     img.push(newImageName);
            // }

            // await product.updateOne({ "_id": formattedId }, {
            //     $set: {
            //         name: req.body.pname,
            //         qnumber: parseInt(req.body.pquantity),
            //         price: req.body.pprice,
            //         category: req.body.pcategory,
            //         description: req.body.pdescription,
            //         image: img,
            //     }
            // })
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
        res.redirect('/admin');
    } catch (error) {
        console.log(error);
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
        res.status(500).send('Internal Server Error');
    }
};


exports.unlistProduct = async (req, res) => {
    let id = req.query.id;
    try {
        await product.updateOne({ "_id": id }, { $set: { unlist: true } }).then(() => {
            res.redirect('/admin/unlistedProduct');
        })
    } catch (error) {
        console.log(error);
    }
}

exports.listProduct = async (req, res) => {
    let id = req.query.id;
    try {
        await product.updateOne({ "_id": id }, { $set: { unlist: false } }).then(() => {
            res.redirect('/admin/products');
        });
    } catch (error) {
        console.log(error);
    }
}

