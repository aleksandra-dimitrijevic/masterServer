require("../config/database").connect();
var express = require('express');
const router = express.Router();
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const stopSchema = new mongoose.Schema({
  number: Number,
  label: String,
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  }
});
stopSchema.index({ location: "2dsphere" })

module.exports = mongoose.model('Stop', stopSchema, 'Stop');