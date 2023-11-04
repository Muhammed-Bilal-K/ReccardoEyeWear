var product = require('../models/productdb');

exports.createNewOne = async (req, res) => {
    var fullcate = req.body.category;
    var exicateg = req.body.choose;
    var giveCate ;

    if (!fullcate) {
        giveCate = exicateg; 
    }else{
        giveCate = fullcate;
    }

    try {
        ImageUpload = req.files.image;
        newImageName = req.body.name;
        uploadPath = require('path').resolve('./') + '/public/uploaded/' + newImageName;
        ImageUpload.mv(uploadPath, (err) => {
            if (err) {
                return console.log('error');
            }
            console.log('done');
        })

        const productDetail = new product({
            name: req.body.name,
            qnumber: req.body.qnumber,
            price: req.body.price,
            choose: giveCate,
            review: req.body.review,
            image: newImageName,
        });
        await productDetail.save();
        res.redirect('/admin');
    } catch (error) {
        console.log('error product');
    }
}


exports.updateNewSpecific = async (req, res) => {
    var id = req.params.id;
    var formattedId = id.replace(/%20/g, ' ');
    console.log(req.body);
    if (req.files) {
        ImageUpload = req.files.image;
        newImageName = req.body.name;
        uploadPath = require('path').resolve('./') + '/public/uploaded/' + newImageName;
        ImageUpload.mv(uploadPath, (err) => {
            if (err) {
                return console.log('error');
            }
            console.log('done');
        })

        await product.updateOne({ "_id": formattedId }, {
            $set: {
                name: req.body.name,
                qnumber: req.body.qnumber,
                price: req.body.price,
                choose: req.body.choose,
                review: req.body.review,
                image: newImageName,
            }
        })
    } else {
        await product.updateOne({ "_id": formattedId }, {
            $set: {
                name: req.body.name,
                qnumber: req.body.qnumber,
                price: req.body.price,
                choose: req.body.choose,
                review: req.body.review
            }
        })
    }

    res.redirect('/admin');
}

exports.deleteOneSpec = async (req, res) => {
    var uid = req.params.id;
    console.log(uid);
    try {
        await product.findByIdAndDelete(uid, req.body);
        res.redirect('/admin');
    } catch (error) {
        console.log('error in deletePart');
    }
}

