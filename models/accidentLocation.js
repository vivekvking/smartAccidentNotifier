const mongoose = require('mongoose')
const accidentLocation = new mongoose.Schema({
    lat: String,
    long: String,
    userId: String,
    time: Date,
})

module.exports = mongoose.model('accidentLocation',accidentLocation);