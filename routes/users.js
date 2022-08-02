var express = require('express');
const router = express.Router();

const DBname = process.env.DB_NAME || 'drivegreen';
const DBhost = process.env.DB_HOST || '127.0.0.1';
const DBport = process.env.DB_PORT || '27017';

var express = require('express');
const mongoose = require("mongoose");

mongoose.connect(`mongodb://${DBhost}:${DBport}/${DBname}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.Promise = global.Promise;
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connection Successful Products!");
});


const UserSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  password: String,
  email: String,
  phone: String,
  status: Number,
  role: String
});

// compile schema to model,
const User = mongoose.model('User', UserSchema, 'User');

router.post('/', (req, res) => {
  mongoose.model('User').findOne({ email: req.body.email.toLowerCase() })
    .then(function (customer) {
      if (customer) {
        return res.status(404).send({ msg: "Already exists" });
      }
      var customer = new User({
        firstName: req.body.firstName,
        password: req.body.password,
        lastName: req.body.lastName,
        email: req.body.email.toLowerCase(),
        phone: req.body.phone,
        role: 'user'
      });

      // save model to database
      customer.save(function (err, p) {
        if (err) return console.error(err);
        console.log("Saved to  collection.");
      });

      res.send({ customer });
    })

});
router.post('/login', (req, res) => {
  mongoose.model('User').findOne({ email: req.body.email.toLowerCase(), password: req.body.password })
    .then(function (customer) {
      if (!customer) return res.status(404).send({ msg: "Bad username or password" });
      res.send({ customer });
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });;
});

router.get('/', function (req, res) {
  res.send({ success: "USERS GET" });
})

module.exports = router;