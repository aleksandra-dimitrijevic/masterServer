require("../config/database").connect();
const JWTsecret = process.env.JWT_SECRET || 'secret';

var express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");

const multer  = require('multer');
const upload = multer({ dest: 'uploads/',
  filename: function (req, file, cb) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  cb(null, file.fieldname + '-' + uniqueSuffix );
}});

mongoose.Promise = global.Promise;

const rateSchema = new mongoose.Schema({
  rate: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const UserSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  password: String,
  email: String,
  phone: String,
  status: Number,
  role: String,
  token: String,
  image: String,
  score: Number,
  ratesNumber: Number,
  rates: [rateSchema]
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
      role: 'user',
      ratesNumber:0,
      score:0,
      rates:[]
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

router.patch('/:id', auth, async(req, res) => {
  try {
    var user = await User.findOneAndUpdate({_id: req.params.id}, {...req.body}, { new: true})
    res.send({ user });
  } catch (err) {
    res.json(err);
  }
})

router.patch('/rate/:id', auth, async(req, res) => {
  try {
    const {userRated, rate} = req.body
    var user = await User.findOne({_id: req.params.id})
    if(!user) res.send({msg:'User not found!'})
    const rateIndex = user.rates.findIndex( r => r.user == userRated)
    if(rateIndex != -1){
      user.score += rate - user.rates[rateIndex].rate;
      user.rates[rateIndex].rate = rate;
    } else {
      user.score += rate;
      user.ratesNumber += 1;
      user.rates.push({
        user: userRated,
        rate
      })
    }

    await user.save()

    res.send({ user });
  } catch (err) {
    res.json(err);
  }
})

router.post('/picture', upload.single('avatar'), async (req, res, next) => {
  await User.findOneAndUpdate({_id: req.body.user}, {image: req.file.filename})
  res.send({file: req.file.filename})
})

router.get('/picture/:name', async (req, res) => {
  res.sendFile(
    `./uploads/${req.params.name}`, { root: '.' }
  );
})

// router.get('/', function (req, res) {
//   res.send({ success: "USERS GET" });
// })


module.exports = router;