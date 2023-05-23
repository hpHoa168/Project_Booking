const express = require('express')
const alert = require('alert');
const { ObjectId, Timestamp } = require('mongodb')
const { getDB, insertObject, deleteSchedule } = require('../databaseHandler')
const { requireManager } = require('../projectLibrary')

const router = express.Router()

router.get('/',requireManager, (req, res) => {
    const user = req.session["Manager"]
    res.render("manager/mnIndex", { user: user })
})

router.get('/viewSchedule',requireManager, async (req, res) => {

    const dbo = await getDB()
    const allSchedule = await dbo.collection("Schedule").find({}).toArray()
    res.render('manager/viewSchedule', { schedules: allSchedule })
})
router.get('/viewTicket', async (req, res) => {

    const dbo = await getDB()
    const allTicket = await dbo.collection("Ticket").find({}).toArray()
    res.render('manager/viewTicket', { tickets: allTicket })
})

router.get('/setRoom',requireManager, async (req, res)=>{

    const dbo = await getDB()
    const allRoom = await dbo.collection("Room").find({}).toArray()
    res.render("manager/setRoom", {rooms: allRoom})
})

// CRUD Schedule
router.get('/addSchedule',requireManager, async (req, res) => {

    const dbo = await getDB();
    const movie = await dbo.collection("Movie").find({}).toArray()
    const allCinema = await dbo.collection("Cinema").find({}).toArray()
    const allRoom = await dbo.collection("Room").find({}).toArray()

    res.render('manager/addSchedule', { movie: movie, cinemas: allCinema, rooms: allRoom })
})



router.post('/addSchedule',requireManager, async (req, res) => {
    const movie = req.body.movie
    const cinema = req.body.cinema
    const room = req.body.room
    const date = req.body.date
    const startTime = req.body.startTime

    const addToSchedule = {
        movie: movie,
        cinema: cinema,
        room: room,
        date: date,
        startTime: startTime,
    }
    await insertObject("Schedule", addToSchedule)
    console.log(cinema);
    const dbo = await getDB();
    await dbo.collection('Room').updateOne({ 'name': room }, {
        $push: {
            'cinema': cinema
        }
    })
    await dbo.collection('Cinema').updateOne({ 'name': cinema }, {
        $push: {
            'rooms': {
                'Room': room
            }
        }
    })
    await dbo.collection("Movie").updateOne({ 'name': movie }, {
        $push: {
            "schedule": {
                '_id': ObjectId(),
                'cinema': cinema,
                'room': room,
                'date': date,
                'startTime': startTime
            }
        }
    })
    res.redirect('viewSchedule')
})

router.get('/editSchedule',requireManager, async (req, res) => {
    const id = req.query.id

    const dbo = await getDB();
    const allMovie = await dbo.collection("Movie").find({}).toArray()
    const allCinema = await dbo.collection("Cinema").find({}).toArray()
    const allRoom = await dbo.collection("Room").find({}).toArray()
    const schedule = await dbo.collection("Schedule").findOne({ _id: ObjectId(id) })
    res.render('manager/editSchedule', { movies: allMovie, cinemas: allCinema, rooms: allRoom, schedule: schedule })
})

router.post('/updateSchedule',requireManager, async (req, res) => {
    const id = req.body.txtId

    const movie = req.body.movie
    const cinema = req.body.cinema
    const room = req.body.room
    const date = req.body.date
    const startTime = req.body.startTime

    const objectToSchedule = {
        $set: {
            movie: movie,
            cinema: cinema,
            room: room,
            date: date,
            startTime: startTime,
        }
    }
    console.log(cinema);
    const dbo = await getDB();

    const filter = { _id: ObjectId(id) }
    await dbo.collection("Schedule").updateOne(filter, objectToSchedule)
    res.redirect('viewSchedule')
})
router.get('/deleteSchedule',requireManager, async (req, res) => {
    const id = req.query.id

    await deleteSchedule(id)
    res.redirect('viewSchedule')
})
router.get("/rooms", async (req, res)=>{

    const dbo = await getDB();
    const allRoom = await dbo.collection("Room").find({}).toArray()
    res.render('manager/rooms', {rooms: allRoom})
})

router.get('/setRoom',requireManager, async (req, res)=>{

    const dbo = await getDB();
    const allRoom = await dbo.collection("Room").find({}).toArray()
    
    res.render('manager/setRoom', {rooms: allRoom})
})

router.post('/setRooms',requireManager, async (req, res)=>{
    const room = req.body.room
    const cols = req.body.txtColumns
    const rows = req.body.txtRows

    console.log(typeof(cols));

    const dbo = await getDB();
    if(cols > "10" || rows > "10" ){
        alert ("Row and Col cannot be more than 10")
    }else{
        await dbo.collection('Room').updateOne({ 'name': room }, {
            $push: {
                'columns': cols,
                'rows': rows
            }
        })
        alert("Row and Col has been successfully set!")
    }
    res.redirect('rooms')
})


module.exports = router;