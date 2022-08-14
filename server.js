var express = require('express');
var app = express();
var usersRouter = require('./routes/users.js');
var ridesRouter = require('./routes/rides.js')

app.use(express.json())
// on the request to root (localhost:8088/)
app.get('/', function (req, res) {
    res.send({success:"HELLO FROM BACKENDD"});
});

app.use('/users', usersRouter);
app.use('/rides', ridesRouter);

app.use(function(req, res, next) {
    res.status(404).send({msg: "Sorry, that route doesn't exist."});
});

// start the server in the port 8088 !
app.listen(8088, function () {
    console.log('Example app listening on port 8088.');
});


