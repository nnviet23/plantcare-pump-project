require('dotenv').config({path:require('node:path').join(__dirname,'../.env'),quiet:true});
const mongoose=require('mongoose');
const {connectDB}=require('../src/config/services');
(async()=>{try{await connectDB();const Sensor=require('../src/models/sensorData');const latest=await Sensor.findOne().sort({createdAt:-1}).lean();console.log(JSON.stringify({database:true,sensor:latest?{soilHumidity:latest.soilHumidity,temperature:latest.temperature,measuredAt:latest.createdAt}:null}));}catch(error){console.log(JSON.stringify({database:false,type:error.name,reasons:[...(error.reason?.servers?.values()||[])].map(server=>({type:server.type,error:server.error?.cause?.code||server.error?.code||server.error?.name||'no response'}))}));}finally{await mongoose.disconnect();}})();
