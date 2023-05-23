const express = require('express')
const multer = require("multer");
const path = require("path");
const alert = require('alert');

const { ObjectId } = require('mongodb')
const { insertObject, getDB, deleteMovie, deleteManager } = require('../databaseHandler')
const { requireUser } = require('../projectLibrary')

const router = express.Router()
router.use(express.static('public'))

//Upload img
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
    }
})
//filter files type
const fileFilter = (req, file, cb) => {
    var ext = path.extname(file.originalname)
    if (ext !== '.png' && ext !== '.jpg' && ext !== ".jpeg") {
        return cb(new Error('Please upload file jpg or png!'))
    }
    cb(null, true)
}

var upload = multer({ storage: storage, fileFilter: fileFilter })

router.get('/profile', requireUser, async (req, res) => {
    const user = req.session["customer"]

    const dbo = await getDB()
    const customer = await dbo.collection("Customer").findOne({ "userName": user.name })
    res.render("customer/profile", { customer: customer, user: user })
})

router.get('/editProfile', requireUser, async (req, res) => {
    const user = req.session["customer"]

    const dbo = await getDB()
    const customer = await dbo.collection("Customer").findOne({ "userName": user.name })

    res.render("customer/editProfile", { customer: customer, user: user })
})

router.get('/viewPoint', requireUser, async (req, res) => {
    const user = req.session["customer"]

    const dbo = await getDB()
    const customer = await dbo.collection("Customer").findOne({ "userName": user.name })

    res.render("customer/point", { customer: customer, user: user })
})

router.get('/history', requireUser, async (req, res) => {
    const user = req.session["customer"]

    const dbo = await getDB()
    const customer = await dbo.collection("Customer").findOne({ "userName": user.name })
    const tickets = await dbo.collection("Ticket").find({}).toArray();

    res.render("customer/history", { tickets: tickets, customer: customer, user: user })
})

router.post('/updateProfile', requireUser, upload.single('myFile'), async (req, res) => {
    const id = req.body.txtId
    const name = req.body.txtName;
    const age = req.body.txtAge;
    const email = req.body.txtEmail;
    const phoneNumber = req.body.txtPhone;
    const point = req.body.txtPoint;
    const img = req.file;
    const address = req.body.txtAddress;

    const objectToObject = {
        $set: {
            name: name,
            age: age,
            email: email,
            phoneNumber: phoneNumber,
            address: address,
            point: point,
            img: img
        }
    }
    const filter = { _id: ObjectId(id) }

    const dbo = await getDB()
    await dbo.collection("Customer").updateOne(filter, objectToObject)
    res.redirect('profile')
})


router.get('/profile', (req, res) => {
    res.render('customer/profile')
})

// booking snack

router.get('/')

module.exports = router;