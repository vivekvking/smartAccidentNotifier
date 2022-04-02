const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv').config();
const port = process.env.PORT || 3000;
const uri = process.env.URI;

const indexRoutes = require('./routes/index');
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(indexRoutes);
app.use((error,req,res,next)=>{
    console.log(error);
    let status = error.statusCode || 500;
    let message = error.message;
    let data = error.data;
    console.log(error);
    res.status(status).json({err_message: message, data: data, status_code: status});
})

mongoose.connect(uri,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("Connected...");
    app.listen(port,()=>{
        console.log("Server started on the port ",port);
    })
}).catch((err)=>{
    console.log("Not connected");
    console.log(err); 
})