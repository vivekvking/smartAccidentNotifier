const mongoose = require('mongoose');
const accidentDataSchema = new mongoose.Schema({
    accidentLocationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'accidentLocation'
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hospital'
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer'
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'driver'
    }
}) 

module.exports = mongoose.model('accidentData',accidentDataSchema);