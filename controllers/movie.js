const express = require('express')
const { ObjectId } = require('mongodb')
const alert = require('alert');
const { insertObject, getDB, deleteMovie, deleteManager } = require('../databaseHandler')
const { requireUser } = require('../projectLibrary')

const router = express.Router()

// router.get('/', async (req, res) => {
//     const cus = req.session["customer"]

//     const dbo = await getDB();
//     const movieSlide = await (await dbo.collection("Movie").find().sort({ views: -1 }).toArray()).slice(0, 3)
//     const selectMovie = await (await dbo.collection("Movie").find().sort({ likes: -1 }).toArray()).slice(0, 4)
//     const eventSlide = await (await dbo.collection("Event").find().sort({ date: -1 }).toArray()).slice(0, 4);

//     res.render('movie/default', { movie: movieSlide, selectMovie: selectMovie, event: eventSlide, user: cus })
// })

router.get('/event', async (req, res) => {
    const cus = req.session["customer"]

    const dbo = await getDB();
    const allEvent = await dbo.collection("Event").find({}).toArray()

    res.render('movie/event', { event: allEvent, user: cus })
})

router.get('/detail_event', async (req, res) => {
    const cus = req.session["customer"]
    const id = req.query.id

    const dbo = await getDB();
    const event = await dbo.collection("Event").findOne({ _id: ObjectId(id) })

    res.render('movie/eventDetails', { event: event, user: cus })
})

router.get('/now-showing', async (req, res) => {
    const cus = req.session["customer"]

    const dbo = await getDB();
    const allMovie = await dbo.collection("Now-showing").find({}).toArray();
    res.render('movie/now-showing', { movieNow: allMovie, user: cus })
})

router.get('/coming-soon', async (req, res) => {
    const cus = req.session["customer"]

    const dbo = await getDB();
    const allMovie = await dbo.collection("Coming-soon").find({}).toArray();
    res.render('movie/coming-soon', { movieComing: allMovie, user: cus })
})

router.get('/detail_movie', async (req, res) => {
    const cus = req.session["customer"]
    const id = req.query.id
    const dbo = await getDB();

    await dbo.collection("Movie").updateOne({ _id: ObjectId(id) }, { $inc: { "views": 1 } })
    await dbo.collection("Now-showing").updateOne({ _id: ObjectId(id) }, { $inc: { "views": 1 } })
    await dbo.collection("Coming-soon").updateOne({ _id: ObjectId(id) }, { $inc: { "views": 1 } })

    const movie = await dbo.collection("Movie").findOne({ _id: ObjectId(id) })

    res.render('movie/movieDetails', { movie: movie, user: cus })
})


router.post('/doLike', requireUser, async (req, res) => {
    const id = req.body.movieId
    const cus = req.session["customer"]

    const dbo = await getDB()
    const customer = await dbo.collection("Customer").findOne({ 'userName': cus.name })
    
        const m = await dbo.collection("Movie").findOne({ $and: [{ _id: ObjectId(id) }, { 'likes': customer._id }] })
        if (m == null) {
            await dbo.collection('Movie').updateOne({ _id: ObjectId(id) }, {
                $push: {
                    'likes': customer._id
                }
            })
        } else {
            await dbo.collection('Movie').updateOne({ _id: ObjectId(id) }, {
                $pull: {
                    'likes': customer._id
                }
            })
        }
})

router.post("/postComment", requireUser, async (req, res) => {
    const id = req.body.movieId;
    const comment = req.body.comments;

    const cus = req.session["customer"]
    const dbo = await getDB()
    const customer = await dbo.collection("Customer").findOne({ 'userName': cus.name })

    await dbo.collection('Movie').updateOne({ _id: ObjectId(id) }, {
        $push: {
            'comments': {
                'customerId': customer._id,
                'userName': customer.name,
                'Image': customer.img,
                'comment': comment
            }
        }
    })
    
})


//Booking

router.get('/seatMovie', requireUser, async (req, res) => {
    const cus = req.session["customer"]

    const startTime = req.query.startTime;
    console.log(startTime);
    const dbo = await getDB()
    const schedule = await dbo.collection("Schedule").findOne({ 'startTime': startTime });
    const movie = await dbo.collection("Movie").findOne({ 'startTime': startTime });

    const room = await dbo.collection("Room").findOne({ 'name': schedule.room });
    res.render('movie/seat', { room: room, schedule: schedule, user: cus, movie: movie})
})

router.post('/user-seat', requireUser, async (req, res) => {
    const cus = req.session['customer']
    //seat
    const movie = req.body.movie;
    const date = req.body.date;
    const cinema = req.body.cinema;
    const room = req.body.room;
    const startTime = req.body.startTime;
    const seatMovie = req.body.seat;
    const price = parseInt(req.body.price)
    var totalPrice = 10;
    console.log(price);

    const dbo = await getDB()
    const customer = await dbo.collection("Customer").findOne({ 'userName': cus.name })

    var totalPoint = 0;
    const cusPoint = customer.point

    const ticket = {
        customer: cus.name,
        movie: movie,
        cinema: cinema,
        room: room,
        date: date,
        startTime: startTime,
        seat: seatMovie,
        price: price
    }
    if(price <= 30){
        totalPoint = totalPoint + 10
        totalPoint = totalPoint + cusPoint 

    }else{
        totalPoint = totalPoint + 20
    }
    totalPoint = totalPoint + cusPoint
    await insertObject("Ticket", ticket)
    await dbo.collection("Customer").updateOne({ "userName": cus.name }, {
        $push: {
            "ticket": {
                movie: movie,
                cinema: cinema,
                room: room,
                date: date,
                startTime: startTime,
                seats: seatMovie,
                price: price
            }
        },
        $set:{
            point: totalPoint
        }
    })
    const allTicket = {
        customer: cus.name,
        movie: movie,
        cinema: cinema,
        room: room,
        date: date,
        startTime: startTime,
        seat: seatMovie,
        price: price
    }
    await insertObject("allTicket", allTicket)

})

//Snack

router.get('/snack', async (req, res) => {
    const cus = req.session["customer"]

    const dbo = await getDB()
    const allSnack = await dbo.collection("Snack").find({}).toArray()
    res.render("movie/snack", { snacks: allSnack, user: cus })
})

router.get('/snackDetail', async (req, res) => {
    const id = req.query.id
    const cus = req.session['customer']
    const dbo = await getDB();
    const snack = await dbo.collection('Snack').findOne({ _id: ObjectId(id) })

    res.render("movie/snackDetail", { snack: snack, user: cus })
})

router.get('/booking_schedule', async (req, res) => {
    const cus = req.session["customer"]

    const id = req.query.id

    const dbo = await getDB()
    const movie = await dbo.collection("Movie").findOne({ _id: ObjectId(id) })
    res.render("movie/bookingSchedule", { movie: movie, user: cus })
})

router.post('/changeSnack', requireUser, async (req, res) => {
    const id = req.body.snackId;
    const point = parseInt(req.body.snackPoint);
    const name = req.body.snackName;


    const cus = req.session['customer']
    const dbo = await getDB()
    const customer = await dbo.collection("Customer").findOne({ 'userName': cus.name })
    const cusPoint = customer.point

    if(cusPoint < point){
        alert("You don't have enough points")
    }else{
        var total = cusPoint - point
        await dbo.collection("Customer").updateOne({ 'userName': cus.name },{
            $push: {
                "exchange": {
                    "name": name,
                    "point": point
                }
            },
            $set: {
                point: total
            }
        })
        alert("Exchange snack successfully!")
    }
})

router.get('/theaters', async (req, res) => {
    const cus = req.session["customer"]

    const dbo = await getDB();
    const allCinema = await dbo.collection('Cinema').find({}).toArray();

    res.render('movie/theaters', { cinemas: allCinema, user: cus })
})

router.get('/gift-card', (req, res) => {
    const cus = req.session["customer"]

    res.render('movie/gift-card', {user: cus})
})




module.exports = router;