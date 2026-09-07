const SensorData = require('../models/sensorData');
const Settings = require('../models/settings');
const WateringLog = require('../models/wateringLog');
const {sendPumpCommand,sendModeCommand} = require('../services/mqttService');
function fail(res,error){return res.status(error.status||500).json({success:false,message:error.status?error.message:'Không xử lý được dữ liệu máy chủ. Vui lòng thử lại.'});}
const getLatestSensors=async(req,res)=>{try{return res.json({success:true,data:await SensorData.findOne().sort({createdAt:-1})});}catch(e){return fail(res,e);}};
const getSensorHistory=async(req,res)=>{try{const data=await SensorData.find().sort({createdAt:-1}).limit(20);return res.json({success:true,data:data.reverse()});}catch(e){return fail(res,e);}};
const getWateringLogs=async(req,res)=>{try{return res.json({success:true,data:await WateringLog.find().sort({createdAt:-1}).limit(50)});}catch(e){return fail(res,e);}};
const getSettings=async(req,res)=>{try{const settings=await Settings.findOne()||await Settings.create({});return res.json({success:true,data:settings});}catch(e){return fail(res,e);}};
const limits={soilThreshold:[0,100],airThreshold:[0,100],tempThreshold:[0,60],lightThreshold:[0,100]};
function validateSettings(body){
  if(body.mode!==undefined&&!['AUTO','MANUAL'].includes(body.mode))return 'Chế độ phải là AUTO hoặc MANUAL.';
  for(const [key,[min,max]] of Object.entries(limits)) if(body[key]!==undefined&&(typeof body[key]!=='number'||!Number.isFinite(body[key])||body[key]<min||body[key]>max))return `${key} phải là số từ ${min} đến ${max}.`;
  if(!Object.keys(body).some(k=>k==='mode'||k in limits)) return 'Chưa có cấu hình để lưu.';
  return '';
}
let deviceBusy=false;
const updateSettings=async(req,res)=>{
  const validation=validateSettings(req.body||{});if(validation)return res.status(400).json({success:false,message:validation});
  if(deviceBusy)return res.status(409).json({success:false,message:'Đang gửi lệnh thiết bị khác. Vui lòng thử lại.'});
  deviceBusy=true;
  try{
    const settings=await Settings.findOne()||new Settings({});
    if(req.body.mode!==undefined){await sendModeCommand(req.body.mode);settings.mode=req.body.mode;}
    for(const key of Object.keys(limits))if(req.body[key]!==undefined)settings[key]=req.body[key];
    await settings.save();
    req.app.get('io')?.emit('settings_update',settings);
    return res.json({success:true,data:settings,message:req.body.mode?'Đã gửi chế độ tới broker MQTT và lưu cấu hình. Chờ thiết bị phản hồi.':'Đã lưu ngưỡng trên máy chủ.'});
  }catch(e){return fail(res,e);}finally{deviceBusy=false;}
};
const controlPump=async(req,res)=>{
  const {action}=req.body||{};
  if(!['ON','OFF'].includes(action))return res.status(400).json({success:false,message:'Lệnh bơm phải là ON hoặc OFF.'});
  if(deviceBusy)return res.status(409).json({success:false,message:'Đang gửi lệnh thiết bị khác. Vui lòng thử lại.'});
  deviceBusy=true;
  try{
    const settings=await Settings.findOne()||await Settings.create({});
    if(action==='ON'&&settings.mode!=='MANUAL')return res.status(409).json({success:false,message:'Hãy chuyển sang Thủ công trước khi bật máy bơm.'});
    const previous=settings.pumpStatus;
    await sendPumpCommand(action);
    settings.pumpStatus=action;await settings.save();
    if(action==='ON'&&previous!=='ON'){
      const sensor=await SensorData.findOne().sort({createdAt:-1});
      await WateringLog.create({startTime:new Date().toLocaleTimeString('vi-VN'),endTime:'Đang hoạt động',duration:'0 giây',mode:settings.mode,humidityBefore:sensor?.soilHumidity!=null?`${sensor.soilHumidity}%`:'Chưa có dữ liệu',reason:'Người dùng bật máy bơm',startedAt:new Date(),status:'RUNNING'});
    }else if(action==='OFF'){
      const log=await WateringLog.findOne({status:'RUNNING'}).sort({createdAt:-1});
      if(log){log.endTime=new Date().toLocaleTimeString('vi-VN');log.duration=`${Math.max(0,Math.round((Date.now()-new Date(log.startedAt||log.createdAt).getTime())/1000))} giây`;log.status='COMPLETED';await log.save();}
    }
    const io=req.app.get('io');io?.emit('pump_status_change',{pumpStatus:action,mode:settings.mode});io?.emit('logs_update');
    return res.json({success:true,pumpStatus:action,message:'Broker MQTT đã nhận lệnh. Trạng thái vật lý cần phản hồi từ ESP32.'});
  }catch(e){return fail(res,e);}finally{deviceBusy=false;}
};
module.exports={getLatestSensors,getSensorHistory,getWateringLogs,getSettings,updateSettings,controlPump,validateSettings};
