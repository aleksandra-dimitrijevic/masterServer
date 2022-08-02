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
  console.log("Connection Successful Stops!");
});

const stopSchema = new mongoose.Schema({
  number: Number,
  ride: {type: mongoose.Schema.Types.ObjectId, ref: 'Ride'},
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  }
});
stopSchema.index({ location: "2dsphere" })

module.exports = mongoose.model('Stop', stopSchema, 'Stop');