const express = require('express')
const router = express.Router();
const indexControllers = require('../controllers/index');
const accidentProcessor = require('../controllers/accidentProcessor');

//adding accident data to db
router.post('/addAccidentLocation',indexControllers.addAccidentLocation);

//add new customer
router.post('/customer',indexControllers.addCustomer);

//add new driver
router.post('/driver',indexControllers.addDriver);

//login customer
router.post('/login/customer',indexControllers.customerLogin);

//login driver
router.post('/login/driver',indexControllers.driverLogin);

//add new hospital
router.post('/hospital',indexControllers.addHospital);

//accident Processor trigger
router.get('/trigger',accidentProcessor.checkRealTimeData);


//default handling
router.get('*',(req,res,next)=>{
    res.send("Welcome to Smart Accident Notifier <br> We have one API running rn <br> curl for that is below <br> curl --location --request POST 'http://localhost:3000/addAccidentLocation' <br>--header 'Content-Type: application/json' <br>--data-raw <br>'{<br>\"lat\":\"0\",<br>\"long\":\"54\",<br>\"id\":\"1a\"<br>}'");
})

module.exports = router;