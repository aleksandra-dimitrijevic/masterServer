// Require express and create an instance of it
var express = require('express');
var app = express();
var usersRouter = require('./routes/users.js');

// on the request to root (localhost:8088/)
app.get('/', function (req, res) {
    res.send({success:"HELLO FROM BACKEND"});
});

// On localhost:8088/welcome
app.get('/welcome', function (req, res) {
    res.send('<b>Hello</b> welcome to my http server made with express');
});
app.use('/users', usersRouter);

// Change the 404 message modifing the middleware
app.use(function(req, res, next) {
    res.status(404).send("Sorry, that route doesn't exist. Have a nice day :)");
});

// start the server in the port 8088 !
app.listen(8088, function () {
    console.log('Example app listening on port 8088.');
});


