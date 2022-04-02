const express = require('express')
const router = express.Router();
const indexControllers = require('../controllers/index');

//adding accident data to db
router.post('/addAccidentLocation',indexControllers.addAccidentLocation);

//default handling
router.get('*',(req,res,next)=>{
    res.send("Welcome to Smart Accident Notifier <br> We have one API running rn <br> curl for that is below <br> curl --location --request POST 'http://localhost:3000/addAccidentLocation' <br>--header 'Content-Type: application/json' <br>--data-raw <br>'{<br>\"lat\":\"0\",<br>\"long\":\"54\",<br>\"id\":\"1a\"<br>}'");
})
module.exports = router;