const path = require('path');
require('dotenv').config({path:path.join(__dirname,'.env'),quiet:true});
const cors = require('cors');
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const {Server} = require('socket.io');
const {connectDB} = require('./src/config/services');
const {initMQTT,isMQTTConnected} = require('./src/services/mqttService');
const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  'https://nnviet23-plantcare-pump-project.vercel.app',
  ...[process.env.CLIENT_URL,process.env.CORS_ORIGINS].filter(Boolean).flatMap(s=>s.split(',')).map(s=>s.trim()).filter(s=>/^https?:\/\//.test(s)),
];
const origin = (value,callback) => callback(null,!value || allowedOrigins.includes(value) || (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(value)));
app.use(cors({origin,credentials:true,methods:['GET','POST','PUT','DELETE','OPTIONS'],allowedHeaders:['Content-Type','Authorization']}));
app.use(express.json({limit:'32kb'}));
const io = new Server(server,{cors:{origin,credentials:true}});
app.set('io',io);
io.use((socket,next)=>{try{jwt.verify(socket.handshake.auth?.token,process.env.JWT_SECRET);next();}catch{next(new Error('Phiên đăng nhập không hợp lệ.'));}});
app.get('/api/health',(req,res)=>res.status(mongoose.connection.readyState===1?200:503).json({status:mongoose.connection.readyState===1?'success':'degraded',database:mongoose.connection.readyState===1?'connected':'disconnected',mqtt:isMQTTConnected()?'connected':'disconnected',aiConfigured:!!process.env.GEMINI_API_KEY,timestamp:new Date()}));
// Do not accept API work while MongoDB is unavailable and silently buffer requests.
app.use(['/api/auth','/api/farm'],(req,res,next)=>mongoose.connection.readyState===1?next():res.status(503).json({success:false,message:'Backend chưa kết nối cơ sở dữ liệu. Kiểm tra cấu hình MongoDB và kết nối mạng.'}));
app.use('/api/auth',require('./src/routes/authRoutes'));
app.use('/api/farm',require('./src/routes/farmRoutes'));
app.use('/api/chatbot',require('./src/routes/chatbotRoutes'));
app.use((err,req,res,next)=>res.status(err.status||500).json({success:false,message:err.type==='entity.too.large'?'Nội dung gửi quá dài.':'Yêu cầu không hợp lệ.'}));
const PORT=process.env.PORT||5000;
server.listen(PORT,()=>console.log(`[Server] Listening on port ${PORT}`));
async function startDatabase(){
 try{await connectDB();initMQTT(io);}
 catch(error){console.error('[Database] Không kết nối được:',error.code||error.name);setTimeout(startDatabase,30000).unref();}
}
startDatabase();
