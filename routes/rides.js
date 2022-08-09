var express = require('express');
const router = express.Router();

const DBname = process.env.DB_NAME || 'drivegreen';
const DBhost = process.env.DB_HOST || '127.0.0.1';
const DBport = process.env.DB_PORT || '27017';

var express = require('express');
const mongoose = require("mongoose");
var StopModel = require('./stops.js');

mongoose.connect(`mongodb://${DBhost}:${DBport}/${DBname}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set('debug', true)
mongoose.Promise = global.Promise;
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connection Successful Rides!");
});

const passengerSchema = new mongoose.Schema({
  start: Number,
  finish: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const RideSchema = mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: Date,
  passengersNumber: Number,
  stops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stop' }],
  availableSeats: Number,
  passengers: [passengerSchema]
});

const Ride = mongoose.model('Ride', RideSchema, 'Ride');

router.post('/', async (req, res) => {
  try {
    const arr = [];
    for (const [i, stop] of req.body.stops.entries()) {
      var s = new StopModel({
        location: { coordinates: [stop.longitude, stop.latitude] },
        number: i,
        label: stop.label
      })
      var savedStop = await s.save();
      arr.push(savedStop._id);
    }

    var ride = new Ride({
      driver: req.body.driver,
      date: req.body.date,
      passengersNumber: req.body.passengersNumber,
      stops: arr,
      availableSeats: req.body.passengersNumber,
      passengers: []
    });

    var savedRide = await ride.save();
    await StopModel.updateMany({ _id: { $in: arr } }, { $set: { ride: savedRide._id } });
    res.send({ ride: savedRide });

  } catch (err) {
    res.send({ err })
  }
});

router.post('/apply', async (req, res) => {
  try {
    // check if user is already applied to this ride
    const ride = await Ride.findOne({_id: req.body._id});
  
    if(ride.availableSeats > 0){
      ride.passengers.push({
        user: req.body.user,
        start: req.body.start,
        finish: req.body.finish
      })
      ride.availableSeats = ride.availableSeats -1;
      await ride.save()
      res.send({msg: 'Successffully applied'})
    }

    else res.send({msg:'Sorry no seats available'})

  } catch (err) {
    res.send({ err })
  }
});

router.post('/remove-passenger', async (req, res) => {
  try {
    const ride = await Ride.updateOne({_id: req.body._id},{$pull:{ passengers :{ user: req.body.user}}, $inc:{availableSeats: 1}});
    console.log(ride);
    res.send({msg: 'Successffully declined passenger'})

  } catch (err) {
    res.send({ err })
  }
});

router.get('/passenger', async function (req, res) {
  try {
    const rides = await Ride.find({ 'passengers.user': {$in: req.query.passenger}}).populate('driver').populate([{ 
      path: 'stops'
    },
    { 
      path: 'passengers',
      populate: {path: 'user' }
    }
  ]);
    res.send({ rides });
  } catch (err) {
    res.send({ err })
  }
})


router.get('/driver', async function (req, res) {
  try {
    const rides = await Ride.find({ driver: req.query.driver }).populate('driver').populate([{ 
      path: 'stops'
    },
    { 
      path: 'passengers',
      populate: {path: 'user' }
    }
  ]);
    res.send({ rides });
  } catch (err) {
    res.send({ err })
  }
})

router.get('/search', async function (req, res) {
  // filter available seats and date
  try {
    const stops = await StopModel.find({ location: { $geoWithin: { $centerSphere: [[req.query.long1, req.query.lat1], 0.3 / 3963.2] } } });
    const response = []
    for (stop of stops) {
      stopFinish = await StopModel.find({ ride: stop.ride, number: { $gt: stop.number }, location: { $geoWithin: { $centerSphere: [[req.query.long2, req.query.lat2], 0.3 / 3963.2] } } })
        .populate([{ 
          path: 'ride',
          populate: {path: 'stops' }
        },
        { 
          path: 'ride',
          populate: {path: 'driver' }
        }
      ]);
      if (stopFinish.length) {
        response.push({ start: stop.number, finish: stopFinish[0].number, ride: stopFinish[0].ride })
      }
    }
    res.send({ response });
  } catch (err) {
    console.log(err)
    res.send({ err })
  }
})

module.exports = router;