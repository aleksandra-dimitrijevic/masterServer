require("../config/database").connect();
const JWTsecret = process.env.JWT_SECRET || 'secret';

var express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  password: String,
  email: String,
  phone: String,
  status: Number,
  role: String,
  token: String
});

// compile schema to model,
const User = mongoose.model('User', UserSchema, 'User');

router.post('/', async (req, res) => {
  try {
    var user = await User.findOne({ email: req.body.email.toLowerCase() })
    if (user) {
      return res.status(404).send({ msg: "Already exists" });
    }
    //Encrypt user password
    //encryptedPassword = await bcrypt.hash(req.body.password, 10);

    user = new User({
      firstName: req.body.firstName,
      password: req.body.password,
      lastName: req.body.lastName,
      email: req.body.email.toLowerCase(),
      phone: req.body.phone,
      role: 'user'
    });

    // save model to database
    user.save(function (err, p) {
      if (err) return console.error(err);
      console.log("Saved to  collection.");
    });
    res.send({ user });
  } catch (err) {
    // If an error occurred, send it to the client
    res.json(err);
  }
});
router.post('/login', async (req, res) => {
  //if (user && (await bcrypt.compare(password, user.password)))
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase(), password: req.body.password })
    if (!user) return res.status(404).send({ msg: "Bad username or password" });
    // Create token
    const token = jwt.sign(
      { user_id: user._id, email: user.email.toLowerCase() },
      JWTsecret,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;
    await user.save();
    res.send({ user });
  }
  catch (err) {
    // If an error occurred, send it to the client
    console.log(err)
    res.json(err);
  }
});

router.get('/', function (req, res) {
  res.send({ success: "USERS GET" });
})

module.exports = router;