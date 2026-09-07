import React, {useEffect,useRef,useState} from 'react';
import {Bot,User,Send,RotateCcw} from 'lucide-react';
import api from '../../services/realtimeApi';
import {apiError} from './farmUtils';
export default function ChatConversation({name,questions,externalQuestion,onConsumed}){
 const [messages,setMessages]=useState([{role:'ai',text:`Xin chào ${name}! 👋\nTôi là PlantCare AI. Tôi hỗ trợ trồng trọt, chăm sóc cây và hệ thống tưới. Bạn cần hỗ trợ gì cho vườn cây?`}]);
 const [input,setInput]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [last,setLast]=useState('');
 const lock=useRef(false);const end=useRef(null);const pending=useRef(null);
 useEffect(()=>{end.current?.scrollIntoView({behavior:'smooth',block:'nearest'});},[messages,busy,error]);
 useEffect(()=>()=>pending.current?.abort(),[]);
 useEffect(()=>{if(externalQuestion){setInput(externalQuestion);onConsumed();}},[externalQuestion,onConsumed]);
 async function send(retry=false){
  const query=(retry?last:input).trim();if(!query||lock.current)return;
  lock.current=true;setBusy(true);setError('');setLast(query);setInput('');
  const history=messages.filter(m=>m.role==='user'||m.role==='ai').slice(1).slice(-8).map(m=>({...m,text:m.text.slice(0,4000)}));
  if(!retry)setMessages(m=>[...m,{role:'user',text:query}]);
  pending.current=new AbortController();
  try{const response=await api.post('/chatbot/ask',{message:query,history},{timeout:90000,signal:pending.current.signal});if(!response.data.success||typeof response.data.reply!=='string')throw new Error();setMessages(m=>[...m,{role:'ai',text:response.data.reply}]);}
  catch(e){if(e.code!=='ERR_CANCELED')setError(apiError(e));}
  finally{lock.current=false;setBusy(false);}
 }
 return <section className="sf-card chat-main"><div className="messages" aria-live="polite">{messages.map((m,i)=><div className={`message ${m.role}`} key={i}><span className="sf-icon purple">{m.role==='ai'?<Bot/>:<User/>}</span><div>{m.text}</div></div>)}{busy&&<p className="thinking" role="status">PlantCare AI đang kiểm tra chủ đề và soạn câu trả lời...</p>}{error&&<div className="sf-error" role="alert"><span>{error}</span><button disabled={busy} onClick={()=>send(true)}><RotateCcw size={15}/>Thử lại</button></div>}<div ref={end}/></div><p className="chat-notice">Chỉ hỗ trợ trồng trọt, chăm sóc cây và vận hành hệ thống tưới.</p><div className="question-chips">{questions.slice(0,3).map(q=><button key={q} disabled={busy} onClick={()=>setInput(q)}>{q}</button>)}</div><form className="chat-input" onSubmit={e=>{e.preventDefault();send();}}><input maxLength={2000} aria-label="Nội dung hỏi AI" value={input} onChange={e=>setInput(e.target.value)} placeholder="Hỏi về cây trồng, sâu bệnh, phân bón hoặc tưới nước..."/><button className="primary" aria-label="Gửi câu hỏi" disabled={busy||!input.trim()}><Send/></button></form></section>;
}
