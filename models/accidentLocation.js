const mongoose = require('mongoose')
const accidentLocationSchema = new mongoose.Schema({
    lat: String,
    long: String,
    time: String,
    date: String,
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer'
    }
})

module.exports = mongoose.model('accidentLocation',accidentLocationSchema);