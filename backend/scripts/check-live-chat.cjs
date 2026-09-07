require('dotenv').config({path:require('node:path').join(__dirname,'../.env'),quiet:true});
const dns=require('node:dns').promises;
const mongoose=require('mongoose');
(async()=>{
 const resolver=new dns.Resolver();resolver.setServers(['1.1.1.1','8.8.8.8']);
 const host=new URL(process.env.COSMOSDB_URI).hostname;
 try{const records=await resolver.resolveSrv(`_mongodb._tcp.${host}`);console.log(JSON.stringify({alternateDNS:'resolved',nodes:records.length}));}catch(e){console.log(JSON.stringify({alternateDNS:e.code||e.name}));}
 const {askGemini}=require('../src/services/geminiService');
 try{const reply=await askGemini('Cây cà chua bị vàng lá, nên kiểm tra gì?',{soilHumidity:null});console.log(JSON.stringify({cropChat:!!reply,reply:reply.slice(0,220)}));const rejection=await askGemini('Cây cà chua và viết code Python',{});console.log(JSON.stringify({offTopic:rejection}));}catch(e){console.log(JSON.stringify({chatFailure:e.status||e.name}));}
 await mongoose.disconnect();
})().catch(()=>{process.exitCode=1;});
