const mongoose = require('mongoose')
const customerSchema = new mongoose.Schema({
    name: String,
    phoneNo: String,
    email: String,
    vehicleBrand: String,
    vehicleColor: String,
    vehicleNo: String
})

module.exports = mongoose.model('customer',customerSchema);