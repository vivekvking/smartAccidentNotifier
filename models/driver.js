const mongoose = require('mongoose');
const driverSchema = new mongoose.Schema({
    name: String,
    phoneNo: String,
    email: String,
    vehicleNo: String,
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hospital'
    }
})

module.exports = mongoose.model('driver',driverSchema);