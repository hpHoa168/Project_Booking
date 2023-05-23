const express = require('express')
const path = require("path");
const multer = require("multer");
const alert = require('alert');
const { ObjectId } = require('mongodb')

const { insertObject, getDB, deleteMovie, deleteManager, deleteCinema, deleteSnack, deleteCate, deleteEvent, deleteRoom } = require('../databaseHandler')
const { requireAdmin } = require('../projectLibrary')


const router = express.Router()


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

router.get('/', requireAdmin,  (req, res) => {
    const user = req.session["Admin"]
    res.render('admin/adIndex', { user: user })
})

router.get('/viewManager', requireAdmin,  async (req, res) => {
    const user = req.session["Admin"]

    const dbo = await getDB();
    const allManager = await dbo.collection("Manager").find({}).toArray();
    res.render('admin/viewManager', { managers: allManager, user: user })
})

router.get('/addManager', requireAdmin,  async (req, res) => {
    const user = req.session["Admin"]
    res.render('admin/addManager', { user: user })
})

router.post('/addManager', requireAdmin,  upload.single('myFile'), async (req, res) => {
    const name = req.body.txtName;
    const userName = req.body.txtUser;
    const passWord = req.body.txtPass;
    const age = req.body.txtAge;
    const email = req.body.txtEmail;
    const phoneNumber = req.body.txtPhone;
    const img = req.file
    const address = req.body.txtAddress;


    if(userName == ""){
        alert ("The userName field cannot be left blank!")
    }else{

        const objectToUser = {
            userName: userName,
            role: "manager",
            passWord: passWord,
        }

        const objectToObject = {
            userName: userName,
            name: name,
            age: age,
            email: email,
            phoneNumber: phoneNumber,
            address: address,
            img: img
        }

        await insertObject("Account", objectToUser)
        await insertObject("Manager", objectToObject)
        alert("Add manager successfully!")
    }


    res.redirect("viewManager")
})

router.get('/editManager',requireAdmin,  async (req, res) => {
    const id = req.query.id

    const user = req.session["Admin"]

    const dbo = await getDB()
    const manager = await dbo.collection("Manager").findOne({ _id: ObjectId(id) })
    res.render('admin/editManager', { manager: manager, user: user })
})

router.post('/updateManager',requireAdmin,  upload.single('myFile'), async (req, res) => {
    const id = req.body.txtId
    const name = req.body.txtName;
    const age = req.body.txtAge;
    const email = req.body.txtEmail;
    const phoneNumber = req.body.txtPhone;
    const img = req.file;
    const address = req.body.txtAddress;

    const objectToObject = {
        $set: {
            name: name,
            age: age,
            email: email,
            phoneNumber: phoneNumber,
            address: address,
            img: img
        }

    }
    const filter = { _id: ObjectId(id) }

    const dbo = await getDB()
    await dbo.collection("Manager").updateOne(filter, objectToObject)
    res.redirect('viewManager')
})

router.get('/deleteManager',requireAdmin,  async (req, res) => {
    const user = req.query.userName

    await deleteManager(user)
    res.redirect("viewManager")
})


//CRUD Movie

router.get('/viewMovie',requireAdmin,  async (req, res) => {
    const user = req.session["Admin"]

    const dbo = await getDB();
    const allMovie = await dbo.collection("Movie").find({}).toArray();
    const allTicket = await dbo.collection("Ticket").find({}).toArray();
    res.render('admin/viewMovie', { movies: allMovie, user: user, tickets: allTicket })
})

router.get('/addMovie', requireAdmin, async (req, res) => {

    const user = req.session["Admin"]

    const dbo = await getDB();
    const allCategory = await dbo.collection("Category").find({}).toArray();
    res.render('admin/addMovie', { user: user, cates: allCategory })
})

router.post('/addMovie',requireAdmin,  upload.single('myFile'), async (req, res) => {
    const name = req.body.txtName
    const director = req.body.txtDir
    const cast = req.body.txtCast
    const category = req.body.category
    const time = req.body.txtTime
    const language = req.body.txtLanguage
    const rule = req.body.txtRule
    const des = req.body.txtDes
    const img = req.file
    // const cinema = []
    // const room = []
    const views = 0
    const likes = []
    const date = req.body.txtDate
    const nowDate = new Date()
    let nowDateString = `${nowDate.getFullYear()}-${nowDate.getMonth() + 1}-${nowDate.getDate()}`
    if (date == nowDateString) {
        const objectToMovie = {
            name: name,
            director: director,
            cast: cast,
            category: category,
            date: date,
            time: time,
            language: language,
            rule: rule,
            des: des,
            img: img,
            views: views,
            likes: likes
        }

        const dbo = await getDB();
        await dbo.collection('Category').updateOne({ 'name': category }, {
            $push: {
                'movie': name,
                'img': img,
                'director': director
            }
        })
        await insertObject("Movie", objectToMovie)
        await insertObject("Now-showing", objectToMovie)
    } else if (date > nowDateString) {
        const objectToMovie = {
            name: name,
            director: director,
            cast: cast,
            category: category,
            date: date,
            time: time,
            language: language,
            rule: rule,
            des: des,
            img: img,
            views: views,
            likes: likes
        }

        const dbo = await getDB();
        await dbo.collection('Category').updateOne({ 'name': category }, {
            $push: {
                'movie': name,
                'img': img,
                'director': director
            }
        })
        await insertObject("Movie", objectToMovie)
        await insertObject("Coming-soon", objectToMovie)
    } else {
        alert('You cannot enter a date that is less than the current date')
    }

    res.redirect('viewMovie')
})

router.get('/editMovie',requireAdmin,  async (req, res) => {
    const id = req.query.id;

    const user = req.session["Admin"]

    const dbo = await getDB();
    const movie = await dbo.collection("Movie").findOne({ _id: ObjectId(id) })
    const allCategory = await dbo.collection("Category").find({}).toArray();

    res.render('admin/editMovie', { movie: movie, user: user, cates: allCategory })
})

router.post('/updateMovie',requireAdmin,  upload.single('myFile'), async (req, res) => {
    const id = req.body.txtId
    const name = req.body.txtName
    const director = req.body.txtDir
    const cast = req.body.txtCast
    const time = req.body.txtTime
    const language = req.body.txtLanguage
    const rule = req.body.txtRule
    const des = req.body.txtDes
    const img = req.file

    const objectToMovie = {
        $set: {
            name: name,
            director: director,
            cast: cast,
            time: time,
            img: img,
            language: language,
            rule: rule,
            des: des
        }
    }

    const filter = { _id: ObjectId(id) }
    const dbo = await getDB();

    await dbo.collection("Movie").updateOne(filter, objectToMovie)
    await dbo.collection("Coming-soon").updateOne(filter, objectToMovie)
    await dbo.collection("Now-showing").updateOne(filter, objectToMovie)

    res.redirect('viewMovie')
})

router.get('/deleteMovie',requireAdmin,  async (req, res) => {
    const id = req.query.id

    await deleteMovie(id)
    res.redirect('viewMovie')
})

//CRUD Room

router.get('/viewRoom',requireAdmin,  async (req, res) => {

    const dbo = await getDB()
    const allRoom = await dbo.collection("Room").find({}).toArray()
    res.render('admin/viewRoom', { rooms: allRoom })
})

router.get('/addRoom',requireAdmin,  (req, res) => {
    res.render('admin/addRoom')
})

router.post('/addRoom',requireAdmin,  async (req, res) => {
    const name = req.body.txtName
    const status = req.body.status
    const addToRoom = {
        name: name,
        status: status
    }
    await insertObject("Room", addToRoom)
    res.redirect("viewRoom")
})

router.get('/editRoom',requireAdmin,  async (req, res) => {
    const id = req.query.id;

    const user = req.session["Admin"]

    const dbo = await getDB();
    const room = await dbo.collection("Room").findOne({ _id: ObjectId(id) })
    res.render('admin/editRoom', { room: room, user: user })
})

router.post('/updateRoom',requireAdmin,  async (req, res) => {
    const id = req.body.txtId
    const name = req.body.txtName
    const status = req.body.status

    const objectToRoom = {
        $set: {
            name: name,
            status: status
        }
    }
    const filter = { _id: ObjectId(id) }
    const dbo = await getDB()
    await dbo.collection("Room").updateOne(filter, objectToRoom)

    res.redirect("viewRoom")
})

router.get('/deleteRoom',requireAdmin,  async (req, res) => {
    const id = req.query.id

    await deleteRoom(id)
    res.redirect('viewRoom')
})

// CRUD Cinema

router.get('/viewCinema',requireAdmin,  async (req, res) => {

    const dbo = await getDB()
    const allCinema = await dbo.collection("Cinema").find({}).toArray()
    res.render('admin/viewCinema', { cinemas: allCinema })
})

router.get('/addCinema', (req, res) => {
    res.render('admin/addCinema')
})

router.post('/addCinema',requireAdmin,  upload.single('myFile'), async (req, res) => {
    const name = req.body.txtName
    const place = req.body.txtPlace
    const rooms = []
    const img = req.file
    const addToCinema = {
        name: name,
        place: place,
        rooms: rooms,
        img: img
    }
    await insertObject("Cinema", addToCinema)
    res.redirect("viewCinema")
})

router.get('/editCinema',requireAdmin,  async (req, res) => {
    const id = req.query.id;

    const user = req.session["Admin"]

    const dbo = await getDB();
    const cinema = await dbo.collection("Cinema").findOne({ _id: ObjectId(id) })
    res.render('admin/editCinema', { cinema: cinema, user: user })
})

router.post('/updateCinema',requireAdmin,  upload.single('myFile'), async (req, res) => {
    const id = req.body.txtId
    const name = req.body.txtName
    const place = req.body.txtPlace
    const img = req.file

    const objectToCinema = {
        $set: {
            name: name,
            place: place,
            img: img
        }
    }
    const filter = { _id: ObjectId(id) }
    const dbo = await getDB()
    await dbo.collection("Cinema").updateOne(filter, objectToCinema)

    res.redirect("viewCinema")
})

router.get('/deleteCinema',requireAdmin,  async (req, res) => {
    const id = req.query.id

    await deleteCinema(id)
    res.redirect('viewCinema')
})

// CRUD Snack

router.get('/viewSnack',requireAdmin,  async (req, res) => {

    const dbo = await getDB()
    const allSnack = await dbo.collection("Snack").find({}).toArray()
    res.render('admin/viewSnack', { snacks: allSnack })
})

router.get('/addSnack', (req, res) => {
    res.render('admin/addSnack')
})

router.post('/addSnack',requireAdmin,  upload.single("myFile"), async (req, res) => {
    const name = req.body.txtName
    const des = req.body.txtDes
    const img = req.file
    const point = req.body.txtPoint
    const amount = 0

    const addToSnack = {
        name: name,
        des: des,
        point: point,
        img: img
    }
    await insertObject("Snack", addToSnack)
    res.redirect("viewSnack")
})

router.get('/editSnack',requireAdmin,  async (req, res) => {
    const id = req.query.id;

    const user = req.session["Admin"]

    const dbo = await getDB();
    const snack = await dbo.collection("Snack").findOne({ _id: ObjectId(id) })
    res.render('admin/editSnack', { snack: snack, user: user })
})

router.post('/updateSnack',requireAdmin,  upload.single('myFile'), async (req, res) => {
    const id = req.body.txtId
    const name = req.body.txtName
    const des = req.body.txtDes
    const point = req.body.txtPoint
    const img = req.file

    const objectToSnack = {
        $set: {
            name: name,
            des: des,
            point: point,
            img: img
        }
    }
    const filter = { _id: ObjectId(id) }
    const dbo = await getDB()
    await dbo.collection("Snack").updateOne(filter, objectToSnack)

    res.redirect("viewSnack")
})
router.get('/deleteSnack', async (req, res) => {
    const id = req.query.id

    await deleteSnack(id)
    res.redirect('viewSnack')
})

// CRUD Category

router.get('/viewCategory',requireAdmin,  async (req, res) => {

    const dbo = await getDB()
    const allCate = await dbo.collection("Category").find({}).toArray()

    res.render('admin/viewCategory', { cate: allCate })
})

router.get('/addCategory', requireAdmin, async (req, res) => {
    res.render('admin/addCategory')
})

router.post('/addCategory',requireAdmin,  async (req, res) => {
    const name = req.body.txtName
    const des = req.body.txtDes

    const addToCate = {
        name: name,
        des: des
    }
    await insertObject("Category", addToCate)

    res.redirect('viewCategory')
})

router.get('/editCate',requireAdmin,  async (req, res) => {
    const id = req.query.id

    const dbo = await getDB()
    const category = await dbo.collection("Category").findOne({ _id: ObjectId(id) })

    res.render('admin/editCate', { cate: category })
})

router.post('/editCate',requireAdmin,  async (req, res) => {
    const id = req.body.txtId
    const name = req.body.txtName
    const des = req.body.txtDes

    const objectToCate = {
        $set: {
            name: name,
            des: des
        }
    }
    const filter = { _id: ObjectId(id) }
    const dbo = await getDB()
    await dbo.collection("Category").updateOne(filter, objectToCate)

    res.redirect('viewCategory')
})

router.get('/deleteCate',requireAdmin,  async (req, res) => {
    const id = req.query.id

    await deleteCate(id)
    res.redirect('viewCategory')
})

//CRUD Event

router.get('/viewEvent', requireAdmin, async (req, res) => {

    const dbo = await getDB()
    const allEvent = await dbo.collection("Event").find({}).toArray()

    res.render('admin/viewEvent', { events: allEvent })
})

router.get('/addEvent',requireAdmin,  async (req, res) => {
    res.render('admin/addEvent')
})

router.post('/addEvent',requireAdmin,  upload.single('myFile'), async (req, res) => {
    const name = req.body.txtName
    const date = req.body.txtDate
    const des = req.body.txtDes
    const img = req.file

    const addToEvent = {
        name: name,
        date: date,
        des: des,
        img: img
    }
    await insertObject("Event", addToEvent)

    res.redirect('viewEvent')
})

router.get('/editEvent',requireAdmin,  async (req, res) => {
    const id = req.query.id

    const dbo = await getDB()
    const event = await dbo.collection("Event").findOne({ _id: ObjectId(id) })

    res.render('admin/editEvent', { event: event })
})

router.post('/updateEvent',requireAdmin,  upload.single('myFile'), async (req, res) => {
    const id = req.body.txtId
    const name = req.body.txtName
    const date = req.body.txtDate
    const des = req.body.txtDes
    const img = req.file

    const objectToEvent = {
        $set: {
            name: name,
            date: date,
            des: des,
            img: img
        }
    }
    const filter = { _id: ObjectId(id) }
    const dbo = await getDB()
    await dbo.collection("Event").updateOne(filter, objectToEvent)

    res.redirect('viewEvent')
})


router.get('/deleteEvent', requireAdmin, async (req, res) => {
    const id = req.query.id

    await deleteEvent(id)
    res.redirect('viewEvent')
})

// Most View, Most like

router.get('/mostView', requireAdmin, async (req, res) => {

    const dbo = await getDB();
    const allMovie = await dbo.collection("Movie").find().sort({ views: -1 }).toArray()
    res.render("admin/viewMovie", { movies: allMovie })
})

router.get('/mostLike', requireAdmin, async (req, res) => {

    const dbo = await getDB();
    const allMovie = await dbo.collection("Movie").find().sort({ likes: -1 }).toArray()
    res.render("admin/viewMovie", { movies: allMovie })
})


module.exports = router;
