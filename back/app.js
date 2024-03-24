const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const authenticateToken = require('./utilities/authMiddleware');

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    const allowedOrigins = [process.env.CLIENT_URL, process.env.CLIENT_URL2];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        //res.setHeader('Access-Control-Allow-Origin', origin); // DEV, TODO: remove this line
        console.log('Origin not allowed');
    }

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


// middlewares
app.use(cors({ origin: [process.env.CLIENT_URL,process.env.CLIENT_URL2], optionsSuccessStatus: 200, credentials: true }));
app.use(express.json({limit: '50mb'}));

app.use(bodyParser.json());

// custom middleware
app.use(function (req, res, next) {
    console.log('\n----------------------\nNew request received at ' + new Date());
    console.log('Method: ' + req.method);
    console.log('URL: ' + req.originalUrl);
    console.log('Body: ' + JSON.stringify(req.body));
    console.log('\n')
    next();
});




// routes
app.use('/uploads', express.static('uploads'));

app.use('/api/users', require('./routes/users'));
app.use('/api/form', require('./routes/form'));


// start the server on port in .env file
app.listen(process.env.PORT, function () {
    console.log('BDS API listening on port ' + process.env.PORT);
    console.log('Client URL: ' + process.env.CLIENT_URL2);
});