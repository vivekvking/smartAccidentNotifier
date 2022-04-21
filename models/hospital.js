const mongoose = require('mongoose');
const hospitalSchema = new mongoose.Schema({
    name: String,
    pincode: String,
    lat: String,
    long: String,
    state: String
});

module.exports = mongoose.model('hospital',hospitalSchema);