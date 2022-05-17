const AccidentLocation = require('../models/accidentLocation');
const Customer = require('../models/customer')
const Login = require('../models/login')
const Driver = require('../models/driver')
const Hospital = require('../models/hospital')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const ObjectId = require('mongoose').Types.ObjectId;
const AccidentData = require('../models/accidentData')

const addAccidentLocation = async(req,res,next)=>{
    try{
        const {lat, long, id} = req.body;
        if(!lat || !long || !id){
            const error = new Error("Insufficient Data")
            error.statusCode = 422;
            throw error;
        }
        AccidentLocation.create({lat,long,userId:id,time: new Date()},(err,data)=>{
            if(err){
                const error = new Error("Data not saved");
                error.statusCode = 500;
                throw error;
            }else{
                console.log("new accident noted",data)
                res.status(200).json({message:"Data added successfully"});
            }
        })
    }
    catch(err){
        if(!err.statusCode)
            err.statusCode = 500;
        console.log("<><><><>Error occured in addAccidentLocation method<><><><>");    
        next(err);
    }
}

const addCustomer = async(req,res,next)=>{
    const {
        name,phoneNo,email,vehicleBrand,vehicleColor,vehicleNo,password
    } = req.body;
    try{
        console.log("Request for new customer addition received");
        if(!name || !phoneNo || !email || !vehicleBrand || !vehicleColor || !vehicleNo || !password){
            const error = new Error("Insufficient Data")
            error.statusCode = 422;
            throw error;
        }
        console.log("req.body = ",req.body);
        const customer = await Customer.create({
            name,phoneNo,email,vehicleBrand,vehicleColor,vehicleNo
        });
        let hashedPass = await bcrypt.hash(password,2);
        let accessToken = jwt.sign({userId:customer._id,role:"customer"},"supersecretkeyforsupersecret",{expiresIn:'30d'});
        let refreshToken = jwt.sign({userId:customer._id,role:"customer"},"supersecretkeyforsupersecret",{expiresIn:'90d'});
        let login = Login.create({
            name,phoneNo,password:hashedPass,accessToken,refreshToken,role:"customer"
        });
        res.status(200).json({message:"Customer created successfully",role:"customer",userId:customer._id,accessToken:accessToken,refreshToken:refreshToken});
    }
    catch(err){
        console.log("<><><><>Error occured in addCustomer method<><><><>")
        if(!err.statusCode)
            err.statusCode = 500;
        next(err);
    }
}

function isValidObjectId(id){
    if(ObjectId.isValid(id)){
        if((String)(new ObjectId(id)) === id)
            return true;       
        return false;
    }
    return false;
}

/* adding a New Driver
name(body) || phoneNo(body) || email(body) || vehicleNo(body) || hospitalId(body) = Id of the hospital associated with ||
password(body)
based upon state driver selects we will show him the list of hospitals and he can select the one he is associated with
*/
const addDriver= async(req,res,next)=>{
    const {
        name, phoneNo, email, vehicleNo, hospitalId, password
    } = req.body;
    try{
        console.log("Request for New driver addition received");
        if(!name||!phoneNo||!email||!vehicleNo||!hospitalId||!password){
            const error = new Error("Insufficient Data");
            error.statusCode = 422;
            throw error;
        }
        if(!isValidObjectId(hospitalId)){
            const error = new Error("Unprocessable request");
            error.statusCode = 422;
            throw error;
        }
        console.log("req.body = ",req.body);
        const driver = await Hospital.findById(hospitalId).then(foundHospital=>{
            const driver = Driver.create({
                name,phoneNo,email,vehicleNo,hospitalId:foundHospital
            });
            return driver;
        }).catch(err=>{
            console.log("Hospital not found");
            console.log(err);
            const error = new Error("Internal Server Error");
            error.statusCode = 500;
            throw error;
        })
        const hashedPass = await bcrypt.hash(password,2);
        const accessToken = await jwt.sign({userId:driver._id,role:'driver'},'supersecretkeyforsupersecret',{expiresIn:'30d'});
        const refreshToken = await jwt.sign({userId:driver._id,role:'driver'},'supersecretkeyforsupersecret',{expiresIn:'90d'});
        const login = await Login.create({
            name,phoneNo,password:hashedPass,accessToken,refreshToken,role:'driver'
        })
        res.status(200).json({message:"driver created successfully",role:"driver",userId:driver._id,accessToken:accessToken,refreshToken:refreshToken});
    }
    catch(err){
        console.log("<><><><>Error occured in addDriver method<><><><>");
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
}

/*Adding a new hospital
req 
    name || body = name of the hospital
    pincode || body = pincode of hospital
    lat || body = latitude of the hospital
    long || body = longitude of the hospital
    state || body = state in which present    
*/
const addHospital = async(req,res,next)=>{
    const {
        name, pincode, lat, long, state
    } = req.body;
    try{
        console.log("New request for hospital addition received");
        if(!name || !pincode || !lat || !long || !state){
            const error = new Error("Insufficient Data");
            error.statusCode = 422;
            throw error;   
        }
        console.log("req.body = ",req.body);
        const hospital = await Hospital.create({
            name,pincode,lat,long,state
        });
        res.status(200).json({message:"Data added successfully", hospital});
    }catch(err){
        console.log("<><><><>Error occured in addHospital method<><><><>");
        if(!err.statusCode)
            err.statusCode = 500;
        next(err);
    }
}

const customerLogin = async(req,res,next)=>{
    const {
        password, phone
    } = req.body;
    try{
        if(!phone || !password){
            const error = new Error("Username or Password missing");
            error.statusCode = 422;
            throw error;
        }
        const user = await Customer.find({ phoneNo : phone }).lean().exec()
        let login = await Login.findOne({ phoneNo : phone }).lean()
        let hashedPassword = login.password;
        let r =await bcrypt.compare(password, hashedPassword)
        if(r==true){
            console.log("Password check successfull")
            let accessToken = jwt.sign({userId:user[0]._id,role:"customer"},"supersecretkeyforsupersecret",{expiresIn:'30d'});
            let refreshToken = jwt.sign({userId:user[0]._id,role:"customer"},"supersecretkeyforsupersecret",{expiresIn:'90d'});
            Login.findOne({phoneNo: phone},function(err,luser){
                luser.accessToken = accessToken
                luser.refreshToken = refreshToken

                luser.save(function(err){
                    if(err)
                        console.log("error", err)
                })
            })
            res.status(200).json({message: "Logged in Successfully",role: "customer", userId: user[0]._id,accessToken, refreshToken});
        }      
    }
    catch(err){
        if(!err.statusCode)
            err.statusCode = 500;
        next(err);    
    }
}


const driverLogin = async(req,res,next)=>{
    const {
        password, phone
    } = req.body;
    try{
        if(!phone || !password){
            const error = new Error("Username or Password missing");
            error.statusCode = 422;
            throw error;
        }
        const user = await Driver.find({ phoneNo : phone }).lean().exec()
        let login = await Login.findOne({ phoneNo : phone }).lean()
        let hashedPassword = login.password;
        let r =await bcrypt.compare(password, hashedPassword)
        if(r==true){
            console.log("Password check successfull")
            let accessToken = jwt.sign({userId:user[0]._id,role:"driver"},"supersecretkeyforsupersecret",{expiresIn:'30d'});
            let refreshToken = jwt.sign({userId:user[0]._id,role:"driver"},"supersecretkeyforsupersecret",{expiresIn:'90d'});
            Login.findOne({phoneNo: phone},function(err,luser){
                luser.accessToken = accessToken
                luser.refreshToken = refreshToken

                luser.save(function(err){
                    if(err)
                        console.log("error", err)
                })
            })
            res.status(200).json({message: "Logged in Successfully",role: "driver", userId: user[0]._id,accessToken, refreshToken});
        }      
    }
    catch(err){
        if(!err.statusCode)
            err.statusCode = 500;
        next(err);    
    }
}

const driverNotification = async(req,res,next)=>{
    const token  = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null
    try{
        if(!token){
            const error = new Error("Authorization failed");
            error.statusCode = 401;
            throw error;
        }
        let decoded = jwt.decode(token);
        if(!decoded.userId && !decoded.role){
            const error = new Error("Token incorrect")
            error.statusCode = 422;
            throw error;
        } 
        let driverId = decoded.userId;
        // jwt.verify(token,'supersecretkeyforsupersecret',function(err,decoded){
        //     if(err){
        //         const error = new Error("Authroization failed");
        //         error.statusCode = 401;
        //         throw error;
        //     }
        //     if(decoded.role === "driver"){
        //         driverId = decoded.userId;
        //     }
        //     else{
        //         const error = new Error("Not a driver");
        //         error.statusCode = 422;
        //         throw error;
        //     }
        // })

        // get the driver details
        const driver = await Driver.findById(driverId).lean();
        const unattendedAccidents = await AccidentData.find({
            hospitalId: ObjectId(driver.hospitalId),
            driverId: {$exists: false}
        }).populate('customerId').populate('accidentLocationId').lean() 
        res.status(200).json({message: "Data collected successfully", data: unattendedAccidents});

    }catch(err){
        if(!err.statusCode)
            err.statusCode = 500;
        next(err)
    }
}

const driverAcceptAccident = async(req,res,next)=>{
    const token  = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null
    const {
        accidentId 
    } = req.body
    try{
        if(!token){
            const error = new Error("Authorization failed");
            error.statusCode = 401;
            throw error;
        }
        if(!accidentId || !isValidObjectId(accidentId)){
            const error = new Error("Unprocessable Entity")
            error.statusCode = 422;
            throw error;
        }
        let decoded = jwt.decode(token);
        if(!decoded.userId && !decoded.role){
            const error = new Error("Token incorrect")
            error.statusCode = 422;
            throw error;
        } 
        let driverId = decoded.userId;
        // get the driver details
        AccidentData.findOne({_id: ObjectId(accidentId)},(err,data)=>{
            if(err){
                const error = new Error("No accident Data found")
                error.statusCode = 404;
                throw error;
            }
            data['driverId']=ObjectId(driverId);
            data.save((err)=>{
                if(err){
                    const error = new Error("Some error occured in accepting accident")
                    error.statusCode = 500
                    throw error
                }
            })
        }) 
        res.status(200).json({message: "Accident assigned to driver successfully"});

    }catch(err){
        if(!err.statusCode)
            err.statusCode = 500;
        next(err)
    }
}


module.exports = {
    addAccidentLocation,
    addCustomer,
    addDriver,
    addHospital,
    customerLogin,
    driverLogin,
    driverNotification,
    driverAcceptAccident
}