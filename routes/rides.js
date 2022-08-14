require("../config/database").connect();

const express = require('express');
const moment = require('moment')
const router = express.Router();
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const StopModel = require('./stops.js');

mongoose.set('debug', true)
mongoose.Promise = global.Promise;

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

router.post('/', auth, async (req, res) => {
  try {
    const arr = [];
    for (const [i, stop] of req.body.stops.entries()) {
      var s = new StopModel({
        location: { coordinates: [stop.longitude, stop.latitude] },
        number: i,
        label: stop.label,
        date: req.body.date,
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

router.delete('/', auth, async (req, res) => {
  try {
    const responseStops = await StopModel.deleteMany({ ride: req.body._id })
    const response = await Ride.deleteOne({ _id: req.body._id });
    res.send({ response })

  } catch (err) {
    res.send({ err })
  }
});


router.post('/apply', auth, async (req, res) => {
  try {
    const { user, start, finish } = req.body
    const ride = await Ride.findOne({ _id: req.body._id });
    const passenger = ride.passengers.find(passenger => passenger.user == req.body.user)

    if (passenger !== undefined) {
      res.status(409).send({ msg: 'You are already applied!' })
      return;
    }
    if (ride.availableSeats > 0) {
      ride.passengers.push({
        user,
        start,
        finish
      })
      ride.availableSeats = ride.availableSeats - 1;
      await ride.save()
      res.send({ msg: 'Successffully applied' })
    }

    else res.status(409).send({ msg: 'Sorry no seats available' })

  } catch (err) {
    res.send({ err })
  }
});

router.post('/remove-passenger', auth, async (req, res) => {
  try {
    const ride = await Ride.updateOne({ _id: req.body._id }, { $pull: { passengers: { user: req.body.user } }, $inc: { availableSeats: 1 } });
    res.send({ msg: 'Successffully declined passenger' })

  } catch (err) {
    res.send({ err })
  }
});

router.get('/passenger', auth, async function (req, res) {
  try {
    const rides = await Ride.find({ 'passengers.user': { $in: req.query.passenger } }).sort([['date', -1]]).populate('driver').populate([{
      path: 'stops'
    },
    {
      path: 'passengers',
      populate: { path: 'user' }
    }
    ]);
    res.send({ rides });
  } catch (err) {
    res.send({ err })
  }
})


router.get('/driver', auth, async function (req, res) {
  try {
    const rides = await Ride.find({ driver: req.query.driver }).populate('driver').sort([['date', -1]]).populate([{
      path: 'stops'
    },
    {
      path: 'passengers',
      populate: { path: 'user' }
    }
    ]);
    res.send({ rides });
  } catch (err) {
    res.send({ err })
  }
})

router.get('/search', auth, async function (req, res) {
  // filter available seats
  try {
    const dateSerach = moment(new Date(req.query.date))
    const stops = await StopModel.find({
      date: {
        $gte: dateSerach.startOf('day').toDate(),
        $lte: dateSerach.endOf('day').toDate()
      },
      location: {
        $geoWithin: { $centerSphere: [[req.query.long1, req.query.lat1], 0.3 / 3963.2] }
      }
    }).sort([['date', 1]]);
    const response = []
    for (stop of stops) {
      stopFinish = await StopModel.find({ ride: stop.ride, number: { $gt: stop.number }, location: { $geoWithin: { $centerSphere: [[req.query.long2, req.query.lat2], 0.3 / 3963.2] } } })
        .populate([{
          path: 'ride',
          populate: { path: 'stops' }
        },
        {
          path: 'ride',
          populate: { path: 'driver' }
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