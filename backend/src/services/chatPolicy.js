const REFUSAL='Tôi chỉ hỗ trợ về trồng trọt, chăm sóc cây, sâu bệnh, phân bón và hệ thống tưới cây. Bạn hãy đặt câu hỏi thuộc các chủ đề này nhé.';
function normalize(text){return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();}
function obviousOffTopic(message){
 const text=normalize(message);
 return /\b(ignore (all|previous)|system prompt|jailbreak|bo qua (moi |tat ca )?(quy tac|chi dan|huong dan)|tiet lo (prompt|chi dan)|dong vai|lap trinh|viet code|javascript|python|bong da|chinh tri|chung khoan|bitcoin|giai (bai )?toan|football|politics|write code)\b/.test(text);
}
module.exports={REFUSAL,obviousOffTopic};
