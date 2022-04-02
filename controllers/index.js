const AccidentLocation = require('../models/accidentLocation');


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
        console.log("Error occured in addAccidentLocation");    
        next(err);
    }
}

module.exports = {
    addAccidentLocation
}