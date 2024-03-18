
const express = require('express')
const port = process.env.PORT || 3000
const app = express()
app.use(express.json())
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const filestore = require("session-file-store")(sessions)
const multer = require('multer')
app.set('views', 'views')
app.set('view engine', 'hbs');
app.use(express.static('public'))
require('dotenv').config();
const uuid = require('uuid4')
const mysql = require('mysql2');
const oneDay = 1000 * 60 * 60 * 24;
const { EncEmail, decEmail, EncPass, decPassword } = require('./Security')
// var Fakerator = require("fakerator");
// var fakerator = Fakerator("en-US");

// cookie parser middleware
app.use(cookieParser());

//session middleware
app.use(sessions({
    name: process.env.Session_name,
    secret: process.env.Session_secret,
    saveUninitialized: false,
    cookie: { maxAge: oneDay, httpOnly: false },
    resave: false,
    store: new filestore({ logFn: function () { } }),
    path: "./sessions/"
}));

//Remove cache
app.use((request, response, next) => {
    response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    response.setHeader("Pragma", "no-cache");
    response.setHeader("Expires", "0");
    next()
});

// Middlewares
function isLogged(request, response, next) {
    const { user } = request.session
    if (user) {
        next()
    }
    else {
        response.redirect('/')
    }
}

const connection = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    multipleStatements: true
})

// Get Methods

//Login page
app.get('/', (req, res) => {
    res.render('Login')
    // res.redirect('/customer-login')
})

// Signup for servicer
app.get('/signup-servicer', (request, response) => {
    response.render('Servicer/Signup')
})

// Servicer dashboard
app.get('/servicer-dashboard', isLogged, (req, res) => {
    res.render('Servicer/Servicer dashboard')
})

// Servicer Jobs
app.get('/servicer-dashboard/my-jobs', isLogged, (req, res) => {
    res.render('Servicer/Servicer Jobs')
})

// Customer dashboard
app.get('/customer-dashboard', isLogged, (req, res) => {
    res.render('Customer/Customer dashboard')
})

// Customer Viewing Servicers
app.get('/customer-dashobard/view-servicers', isLogged, (request, response) => {
    response.render('Customer/View Servicers')
})

// Customer their requests
app.get('/get-customer-requests', (request, response) => {
    // const query = `SELECT r.ID,r.Date,r.Purpose,r.Description,r.Pickup,r.Customer_Location,r.Geolocation, r.LocationOfService,s.UserName,s.CompanyName, 
    // FROM 
    //     requests r
    // LEFT JOIN
    //     servicers s
    // ON r.Servicer_Email = s.Email
    // WHERE r.Customer_Email = ?
    // `

    const query = `
    SELECT r.Date, r.ID, r.Purpose, r.Description, r.Pickup, 
        r.Customer_Location, r.LocationOfService, 
        s.UserName, s.CompanyName
        FROM requests r
        JOIN servicers s ON r.Servicer_Email = s.Email;

    `
    // const query = `SELECT * FROM requests WHERE Customer_Email = ?`
    connection.query(query, [request.session.user.Email], (error, results) => {
        if (error) {
            console.log(error)
            response.status(500).json({ message: 'Error' })
        }
        else {
            response.status(200).json({ message: 'Success', data: results })
        }
    })
})


//Send all servicers
app.get('/get-all-servicers', (request, response) => {
    const query = `SELECT UserName,CompanyName,CompanyLocation,Email,Phone,Car_Service,Car_Wash,Car_Repair,Car_Painting,Car_Design FROM servicers`;
    connection.query(query, (error, results) => {
        if (error) {
            response.status(500).json({ message: 'Error' })
        }
        else {
            results.forEach((result) => {
                result.Email = decEmail(result.Email)
            })
            response.status(200).json({ message: 'Success', data: results })
        }
    })
})

// Get servicer data
app.get('/get-serivcer-data', (request, response) => {
    const { Email } = request.session.user;
    const query = `SELECT * FROM servicers WHERE Email = ?`;
    // const query = `SELECT First_Name,Last_Name,Email,Phone,Services FROM users WHERE Email = ?`;
    connection.query(query, [Email], (error, results) => {
        if (error) {
            response.status(500).json({ message: 'Error' })
        }
        else {
            console.log(results)
            delete results[0].Password
            results[0].Email = decEmail(results[0].Email)
            response.status(200).json({ message: 'Success', data: results })
        }
    })
})

// Logout

app.get('/logout', (request, response) => {
    request.session.destroy((err) => {
        if (err) throw err;
        request.session = null;
        response.clearCookie('user')
        response.clearCookie('User_Session')
        response.redirect('/')
    })
})

//Post Methods

//Signup for servicers
app.post('/signup-servicer', (request, response) => {
    console.log(request.body)
    const { user_name, user_email, user_password, companyName, companyLocation, Car_Service, Car_Wash, Car_Paint, Car_Repair, Car_Design, geoLocation, companyPhone } = request.body;
    const query = `INSERT INTO servicers (UserName, Email, Password, CompanyName, CompanyLocation, Car_Service, Car_Wash, Car_Painting, Car_Repair, Car_Design, geoLocation,Phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    connection.query(query, [user_name, EncEmail(user_email), EncPass(user_password), companyName, companyLocation, Car_Service ? 1 : null, Car_Wash ? 1 : null, Car_Paint ? 1 : null, Car_Repair ? 1 : null, Car_Design ? 1 : null, JSON.stringify(geoLocation), companyPhone], (error, results) => {
        if (error) {
            if (error.errno === 1062) {
                return response.status(500).json({ message: 'Email already exists' })
            }
            else {
                console.log(error)
                response.status(500).json({ message: 'Error' })
            }
        }
        else {
            response.status(200).json({ message: 'Success' })
        }
    })
})

// Login for servicers
app.post('/login-servicer', (request, response) => {
    const { email, password } = request.body;
    console.log(request.body)
    const query = `SELECT * FROM servicers WHERE Email = ? AND Password = ?`;
    connection.query(query, [EncEmail(email), EncPass(password)], (error, results) => {
        if (error) {
            response.status(500).json({ message: 'Error' })
        }
        else {
            if (results.length > 0) {
                request.session.user = results[0];
                return response.status(200).json({ message: 'Success' })
            }
            else {
                return response.status(401).json({ message: 'Invalid credentials' })
            }
        }
    })
})

//Login for customers
app.post('/login-customer', (request, response) => {
    const { email, password } = request.body;
    const query = `SELECT * FROM users WHERE Email = ? AND Password = ?`;
    connection.query(query, [EncEmail(email), EncPass(password)],
        (error, results) => {
            if (error) {
                response.status(500).json({ message: 'Error' })
            }
            else {
                if (results.length > 0) {
                    request.session.user = results[0];
                    return response.status(200).json({ message: 'Success' })
                }
                else {
                    return response.status(401).json({ message: 'Invalid credentials' })
                }
            }
        })
})

// User submitting request
app.post('/request-car', (request, response) => {
    console.log(request.body)
    const { date, location, purpose, description, pickup, currentLocation, position, email } = request.body;
    console.log(request.session.user)
    const { First_Name, Email } = request.session.user;
    const query = `INSERT INTO requests (ID, Customer_Email, Servicer_Email, Date, Purpose, Description, Pickup, Customer_Location, Geolocation, Customer_Name, LocationOfService) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
    connection.query(query, [uuid(), Email, EncEmail(email), date, purpose, description, pickup, currentLocation, JSON.stringify(position), First_Name, location], (error, results) => {
        if (error) {
            console.log(error)
            response.status(500).json({ message: 'Error' })
        }
        else {
            response.status(200).json({ message: 'Success' })
        }
    })
})
//Put Methods

//Delete Methods

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})