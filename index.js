
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
const {sendStatus,sendEmail} = require('./Mailing')

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

// Signup for customers
app.get('/signup-customer', (request, response) => {
    response.render('Customer/Signup')
})

// Servicer dashboard
app.get('/servicer-dashboard', isLogged, (req, res) => {
    res.render('Servicer/Servicer dashboard')
})

// Servicer Jobs
app.get('/servicer-dashboard/my-jobs', isLogged, (req, res) => {
    res.render('Servicer/Servicer Jobs')
})

//Servicer Request Details
app.get('/servicer-request-details', isLogged, (req, res) => {
    res.render('Servicer/Request Details')
})

// Customer dashboard
app.get('/customer-dashboard', isLogged, (req, res) => {
    res.render('Customer/Customer dashboard')
})

// Customer Viewing Servicers
app.get('/customer-dashobard/view-servicers', isLogged, (request, response) => {
    response.render('Customer/View Servicers',{apiKey:process.env.apiKey})
})

// Customer viewing request details
app.get('/customer-dashboard/request-details', isLogged, (request, response) => {
    response.render('Customer/Request Details',{apiKey:process.env.apiKey})
})

// Customer their requests
app.get('/get-customer-requests', (request, response) => {
    const query = `
    SELECT r.Date, r.ID, r.Purpose, r.Description, r.Pickup, 
        r.Customer_Location, r.LocationOfService, r.Status, 
        s.UserName, s.CompanyName, s.Email
        FROM requests r
        JOIN servicers s ON r.Servicer_Email = s.Email
        WHERE r.Customer_Email = ?;
    `
    // const query = `SELECT * FROM requests WHERE Customer_Email = ?`
    connection.query(query, [request.session.user.Email], (error, results) => {
        if (error) {
            console.log(error)
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

//Seding to customers the details of a request
app.get('/request-details/:requestID', (request, response) => {
    const { requestID } = request.params;
    console.log(requestID)
    // const query = `SELECT * FROM requests WHERE ID = ?`;
    const query = `
    SELECT r.Date, r.ID, r.Purpose, r.Description, r.Pickup, 
        r.Customer_Location, r.LocationOfService, r.Status, r.GeoLocation,
        s.UserName, s.CompanyName, s.Email, s.Phone
        FROM requests r
        JOIN servicers s ON r.Servicer_Email = s.Email
        WHERE r.ID = ?;
    `
    connection.query(query, [requestID], (error, results) => {
        if (error) {
            console.log(error)
            response.status(500).json({ message: 'Error' })
        }
        else {
            results[0].Email = decEmail(results[0].Email)
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


// Servicers their requests
app.get('/get-servicer-requests', (request, response) => {
    console.log("GOT HERE")
    const query = `
    SELECT r.Date, r.ID, r.Purpose, r.Description, r.Pickup, 
        r.Customer_Location, r.LocationOfService, r.Status, r.Customer_Email, 
        s.UserName, s.CompanyName,
        c.First_Name, c.Last_Name 
        FROM requests r
        JOIN servicers s ON r.Servicer_Email = s.Email
        JOIN customers c ON r.Customer_Email = c.Email
        WHERE r.Servicer_Email = ?;
    `
    // const query = `SELECT * FROM requests WHERE Customer_Email = ?`
    connection.query(query, [request.session.user.Email], (error, results) => {
        if (error) {
            console.log(error)
            response.status(500).json({ message: 'Error' })
        }
        else {
            results.forEach((result) => {
                result.Customer_Email = decEmail(result.Customer_Email)
            })
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

app.get('/get-servicer-requests-detail/:requestID',(request,response)=>{
    console.log(request.session.user.Email)
    console.log(request.params)
    const {requestID} = request.params
    const query = `
    SELECT r.Date, r.ID, r.Purpose, r.Description, r.Pickup,
        r.Customer_Location, r.LocationOfService, r.Status, r.GeoLocation,
        c.First_Name, c.Last_Name, c.Email, c.Phone
        FROM requests r
        JOIN customers c ON r.Customer_Email = c.Email
        WHERE r.ID = ? AND r.Servicer_Email = ?;
    `
    connection.query(query, [requestID,request.session.user.Email], (error, results) => {
        if (error) {
            console.log(error)
            response.status(500).json({ message: 'Error' })
        }
        else {
            results[0].Email = decEmail(results[0].Email)   
            response.status(200).json({ message: 'Success', data: results })
        }
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

//Signup for customers
app.post('/signup-customer', (request, response) => {
    console.log(request.body)
    const { fname, lname, phoneNumber, user_email, user_password } = request.body;
    const query = `INSERT INTO customers (First_Name, Last_Name, Email, Password, Phone) VALUES (?, ?, ?, ?, ?)`;
    connection.query(query, [fname, lname, EncEmail(user_email), EncPass(user_password), phoneNumber], (error, results) => {
        if (error) {
            if (error.errno === 1062) {
                console.log(error)
                return response.status(401).json({ message: 'Email already exists' })
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
            console.log(error)
            response.status(500).json({ message: 'Error' })
        }
        else {
            if (results.length > 0) {
                request.session.user = results[0];
                request.session.user.type = 'servicer'
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
    const query = `SELECT * FROM customers WHERE Email = ? AND Password = ?`;
    connection.query(query, [EncEmail(email), EncPass(password)],
        (error, results) => {
            if (error) {
                response.status(500).json({ message: 'Error' })
            }
            else {
                if (results.length > 0) {
                    request.session.user = results[0];
                    request.session.user.type = 'servicer'
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
    const { date, location, purpose, description, pickup, currentLocation, position, email,servicer_name } = request.body;
    console.log(request.session.user)
    const { Email, First_Name, Last_Name } = request.session.user;
    const query = `INSERT INTO requests (ID, Customer_Email, Servicer_Email, Date, Purpose, Description, Pickup, Customer_Location, Geolocation, Status, LocationOfService) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
    connection.query(query, [uuid(), Email, EncEmail(email), date, purpose, description, pickup, currentLocation, JSON.stringify(position), "PENDING", location], async (error, results) => {
        if (error) {
            console.log(error)
            response.status(500).json({ message: 'Error' })
        }
        else {
            await sendEmail({receiver:email,subject:"New Request",text:`You have a new request from ${First_Name} ${Last_Name} about ${purpose} on ${date} at ${location} with the following description: ${description} `,recipientName:servicer_name,senderName:First_Name})
            response.status(200).json({ message: 'Success' })
        }
    })
})
//Put Methods

//Cancelling a request
app.put('/cancel-request', (request, response) => {
    const { requestID,username,purpose,description,servicer_email } = request.body;
    console.log(request.body)
    const {First_Name,Last_Name} = request.session.user
    const query = `UPDATE requests SET Status = 'CANCELLED' WHERE ID = ?`;
    connection.query(query, [requestID], async (error, results) => {
        if (error) {
            response.status(500).json({ message: 'Error' })
        }
        else {
            await sendEmail({receiver:servicer_email,subject:"Request Cancelled",text:`Your request about ${purpose} with the following description: ${description} has been cancelled by ${First_Name} ${Last_Name}`,recipientName:username,senderName:First_Name})
            response.status(201).json({ message: 'Success' })
        }
    })
})

//Rejecting a request
app.put('/reject-request', (request, response) => {
    const { requestID, customerEmail,firstName,purpose,date,description,companyName } = request.body;
    const { UserName} = request.session.user;
    const query = `UPDATE requests SET Status = 'REJECTED' WHERE ID = ?`;
    connection.query(query, [requestID], (error, results) => {
        if (error) {
            response.status(500).json({ message: 'Error' })
        }
        else {
            sendEmail({receiver:customerEmail,subject:"Request Rejected",text:`Your request about ${purpose} on ${date} with the following description: ${description} has been rejected by ${UserName} from ${companyName}`,recipientName:firstName,senderName:UserName})
            response.status(201).json({ message: 'Success' })
        }
    })
})

//Accepting a request
app.put('/accept-request', (request, response) => {
    const { requestID, customerEmail,firstName,purpose,date,description,companyName } = request.body;
    const { UserName} = request.session.user;
    const query = `UPDATE requests SET Status = 'ACCEPTED' WHERE ID = ?`;
    connection.query(query, [requestID], async (error, results) => {
        if (error) {
            response.status(500).json({ message: 'Error' })
        }
        else {
            sendEmail({receiver:customerEmail,subject:"Request Accepted",text:`Your request about ${purpose} on ${date} with the following description: ${description} has been accepted by ${UserName} from ${companyName}`,recipientName:firstName,senderName:UserName})
            response.status(201).json({ message: 'Success' })
        }
    })
})


//Delete Methods

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})