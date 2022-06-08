const axios = require('axios').default;
const AccidentLocation = require('../models/accidentLocation');
const Hospital = require('../models/hospital');
const AccidentData = require('../models/accidentData');
const ObjectId = require('mongoose').Types.ObjectId;
// async function checkNewAccidents(){
const checkRealTimeData = async(req,res,next)=>{
    try{
        // console.time();
        // console.log("Request for triggering accident processor received")
        // getting data from firebase
        const url = process.env.fbUrl;
        const response = await axios.get(url);
        if(response.status != 200){
            const error = new Error("Some error occured in response to get real time data");
            throw error;
        }
        if(response.data){
            // console.log(response.data);
            for(let customerId in response.data){ 
                // console.log("PROCESSING CUSTOMER = ", customerId);
                const { Date, Latitude, Longitude, Time} = response.data[customerId];
                if(!Date || !Latitude || !Longitude || !Time || Date =='' || Latitude == '' || Longitude =='' || Time==''){
                    // console.log("Skipping Customer");
                    continue;
                }
                // console.log("Finding entry for the user in accidentlocations table");
                let same_accident_flag = false;
                await AccidentLocation.findOne({"customerId" : ObjectId(customerId)}).exec()
                .then(acci=>{
                    if(acci){
                        // console.log("Data from DB= ", acci);
                        //entry found but same accident
                        if(acci.date == Date && acci.time == Time && acci.lat == Latitude && acci.long == Longitude){
                            // console.log("Older accident")
                            same_accident_flag = true;
                            return;
                        }
                        //entry found but another accident
                        else{
                            console.log("New Accident");
                            acci.date = Date;acci.lat = Latitude;acci.long = Longitude;acci.time = Time;
                            acci.save((err,newacc)=>{
                                if(err){
                                    console.log("error occured in updating accident data", err);
                                    // throw(err);
                                }else{
                                    console.log("Accident location updated", newacc);
                                    afterAccident(newacc)
                                }
                            });
                        }
                    }
                    //entry not found means new accident
                    else{
                        AccidentLocation.create({
                            lat: Latitude,long: Longitude,date: Date,time: Time,customerId
                        }).then(acc =>{
                            console.log("New Accident Noted", acc);
                            afterAccident(acc);
                        })
                    }
                })
                .catch(err=>{
                    console.log("Error occured in finding ", customerId, " in AccidentLocation in DB");
                })
            }
        }
        // res.status(200).json({message:"Triggered successfully"});
        // console.timeEnd();
    }catch(err){
        console.log("<><><><><>Error occured in checking Realtime Data<><><><><>");
        console.log(err);
    }
};

const afterAccident = async(acci)=>{
    const {
        lat, long, customerId
    } = acci;
    try{
        console.log("Entered into after accident");
        if(!lat || !long || !customerId){
            const error = new Error("Accident Data incomplete");
            throw error;
        }
        let hospitals = await Hospital.find().limit(10).exec();
        if(hospitals.length==0){
            const error = new Error("No Hospitals found");
            throw error;
        }
        let c_hos,mind =Number.MAX_VALUE;
        hospitals.forEach(h=>{
            let dis = Math.sqrt(Math.pow(h.lat-lat,2)+Math.pow(h.long-long,2));
            console.log(`distance for hospital ${h.name} = ${dis}`);
            if(dis<mind){
              mind = dis;  
              c_hos = h;  
            }
        })
        AccidentData.create({
            accidentLocationId: acci,
            hospitalId: c_hos,
            customerId: customerId,
        }).then(data =>{
            console.log("New AccidentData record added ", data);
        }).catch(err=>{
            console.log("Error occured in adding new accidentdata record", err);
        })
    }
    catch(err){
        console.log("<><><><> Error occured in afterAccident method<><><><>")
        console.log(err);
    }
}

setInterval(checkRealTimeData,1000*3)

module.exports = {
    checkRealTimeData
}

// checkRealTimeData();