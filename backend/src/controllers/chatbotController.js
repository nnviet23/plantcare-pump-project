const SensorData = require('../models/sensorData');
const Settings = require('../models/settings');
const {askGemini} = require('../services/geminiService');
const {REFUSAL,obviousOffTopic} = require('../services/chatPolicy');
const handleChat = async (req,res) => {
 const {message,history=[]}=req.body||{};
 if(typeof message!=='string'||!message.trim()||message.length>2000)return res.status(400).json({success:false,message:'Câu hỏi phải từ 1 đến 2.000 ký tự.'});
 if(!Array.isArray(history)||history.length>10||history.some(m=>!m||!['user','ai'].includes(m.role)||typeof m.text!=='string'||m.text.length>4000))return res.status(400).json({success:false,message:'Lịch sử trò chuyện không hợp lệ.'});
 if(obviousOffTopic(message))return res.json({success:true,reply:REFUSAL});
 try{
  const [sensorResult,settingsResult]=await Promise.allSettled([SensorData.findOne().sort({createdAt:-1}),Settings.findOne()]);
  const sensor=sensorResult.status==='fulfilled'?sensorResult.value:null;
  const settings=settingsResult.status==='fulfilled'?settingsResult.value:null;
  const contextData={measuredAt:sensor?.createdAt||null,soilHumidity:sensor?.soilHumidity??null,temperature:sensor?.temperature??null,airHumidity:sensor?.airHumidity??null,lightIntensity:sensor?.lightIntensity??null,lightRaw:sensor?.lightRaw??null,waterLevel:sensor?.waterLevel??null,mode:settings?.mode??null,pumpStatus:settings?.pumpStatus??null};
  const reply=await askGemini(message.trim(),contextData,history);
  return res.json({success:true,reply});
 }catch(error){
  console.error('[Chatbot] Request failed:',error.status||error.name);
  const status=error.status===429?429:503;
  return res.status(status).json({success:false,message:status===429?'AI đang giới hạn lượt sử dụng. Vui lòng thử lại sau.':'Không kết nối được dịch vụ AI. Kiểm tra GEMINI_API_KEY, hạn mức API và mạng máy chủ.'});
 }
};
module.exports={handleChat};
