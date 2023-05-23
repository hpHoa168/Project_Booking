const express = require('express')
const session = require('express-session')
const alert = require('alert');

const { getRole, insertObject, getDB, ObjectId } = require('./databaseHandler')

const app = express()

app.set('view engine', 'hbs')
app.use(express.urlencoded({ extended: true }))
// app.use(express.static('public'))
app.use("/images", express.static('images'))

app.use("/public", express.static('public'))
app.use(express.static('public'))

app.use(session({
    key: 'user_id',
    secret: '124447yd@@$%%#',
    cookie: { maxAge: 900000 },
    saveUninitialized: false,
    resave: false
}))


app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/', async (req, res) => {
    const cus = req.session["customer"]

    const dbo = await getDB();
    const movieSlide = await (await dbo.collection("Movie").find().sort({ views: -1 }).toArray()).slice(0, 3)
    const selectMovie = await (await dbo.collection("Movie").find().sort({ likes: -1 }).toArray()).slice(0, 4)
    const eventSlide = await (await dbo.collection("Event").find().sort({ date: -1 }).toArray()).slice(0, 4);

    res.render('default', { movie: movieSlide, selectMovie: selectMovie, event: eventSlide, user: cus })
})

app.post('/login', async (req, res) => {
    const name = req.body.txtUser
    const pass = req.body.txtPass
    const role = await getRole(name, pass)
    const db = await getDB();
    const customer = await db.collection('Account').findOne({ $and: [{ username: name }, { password: pass }] });
    if (customer) {
        req.session.Acc = {
            _id: user._id,
            name: name,
            role: role
        }
    }

    if (role == -1) {
        alert("Username or password wrong!")
        res.render('login')
    } else if (role == "admin") {
        req.session["admin"] = {
            name: name,
            role: role
        }
        res.redirect("admin")
    } else if (role == "manager") {
        req.session["manager"] = {
            name: name,
            role: role
        }
        res.redirect("manager")
    } else if (role == "customer") {
        req.session["customer"] = {
            name: name,
            role: role
        }
        res.redirect("/")
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const userName = req.body.txtUser;
    const passWord = req.body.txtPass;
    const email = req.body.txtEmail;
    const phoneNumber = req.body.txtPhone;

    const objectToUser = {
        userName: userName,
        role: "customer",
        passWord: passWord,
    }

    const objectToCus = {
        userName: userName,
        email: email,
        phoneNumber: phoneNumber
    }

    await insertObject("Account", objectToUser)
    await insertObject("Customer", objectToCus)
    res.redirect('login')
})


const adminController = require('./controllers/admin')
app.use('/admin', adminController)

const managerController = require('./controllers/manager')
app.use('/manager', managerController)

const movieController = require('./controllers/movie')
app.use('/movie', movieController)
const userController = require('./controllers/customer')
app.use('/customer', userController)

const PORT = process.env.PORT || 2612;
app.listen(PORT)
console.log("Server is running: " + PORT)