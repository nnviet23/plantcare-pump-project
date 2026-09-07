require('dotenv').config({path:require('node:path').join(__dirname,'../.env'),quiet:true});
const dns=require('node:dns').promises;
const {GoogleGenerativeAI}=require('@google/generative-ai');
(async()=>{
 const result={};
 try{const uri=new URL(process.env.COSMOSDB_URI);await dns.resolveSrv(`_mongodb._tcp.${uri.hostname}`);result.mongoDNS='resolved';}catch(e){result.mongoDNS=e.code||e.name;}
 try{
  const ai=new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model=ai.getGenerativeModel({model:process.env.GEMINI_MODEL||'gemini-2.5-flash'});
  const response=await model.generateContent('Trả lời bằng một câu tiếng Việt: nên kiểm tra gì khi cây cà chua bị vàng lá?',{timeout:20000});
  result.gemini={success:!!response.response.text().trim()};
 }catch(e){result.gemini={success:false,status:e.status||e.name};}
 console.log(JSON.stringify(result,null,2));
})().catch(()=>{console.log('Diagnostics failed');process.exitCode=1;});
