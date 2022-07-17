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
    console.log("Connection Successful Rides!");
  });

const stopSchema = new mongoose.Schema({ 
  latitude: Number,
  longitude: Number
});
  
const RideSchema = mongoose.Schema({
    driver: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    date: Date,
    passengersNumber: Number,
    stops: [stopSchema]
  });

  // compile schema to model,
const Ride = mongoose.model('Ride', RideSchema, 'Ride');

router.post('/',(req,res)=>{
      console.log(req.body.stops)
      var ride = new Ride({
        driver: req.body.driver, 
        date:req.body.date,
        passengersNumber:req.body.passengersNumber,
        stops: req.body.stops
       });

        // save model to database
        ride.save(function (err, p) {
          if (err) return console.error(err);
          console.log("Saved to  collection.");
        });
       
        res.send({ride});
});

router.get('/',function (req, res) {   
    res.send({success:"RIDES GET"});
})

module.exports = router;