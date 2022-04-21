const mongoose = require('mongoose')
const loginSchema = new mongoose.Schema({
    name: String,
    phoneNo: String,
    password: String,
    accessToken: String,
    refreshToken: String,
    role: String,
})

module.exports = mongoose.model('login',loginSchema);