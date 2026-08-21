import React, { useState, useRef, useEffect } from 'react';
import styles from './chatbot.module.css';
import { Send, Bot, User, Sparkles } from 'lucide-react';

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Xin chào Nam Việt! Tôi là Trợ lý AI PlantCare. Tôi có thể giúp gì cho vườn cây của bạn hôm nay?',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gửi câu hỏi
  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    // Tin nhắn người dùng
    const userMsg = { id: Date.now(), sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Phản hồi giả lập từ AI (Trợ lý thông minh)
    setTimeout(() => {
      let aiReply = 'Cảm ơn bạn đã hỏi. Tôi đang phân tích thông số từ cảm biến để tư vấn chính xác nhất!';
      
      if (query.includes('vàng lá')) {
        aiReply = 'Lá cây bị vàng thường do 2 nguyên nhân chính: Tưới quá nhiều nước gây úng rễ (độ ẩm đát > 85%) hoặc thiếu ánh sáng. Bạn nên kiểm tra lại mực nước bể và giảm tần suất tưới tự động nhé!';
      } else if (query.includes('độ ẩm')) {
        aiReply = 'Độ ẩm đất tối ưu cho hầu hết các loại cây cảnh văn phòng là từ 40% - 70%. Hiện tại hệ thống đang báo 68%, đây là mức rất lý tưởng!';
      } else if (query.includes('lịch tưới')) {
        aiReply = 'Nên đặt lịch tưới vào lúc sáng sớm (6:00 - 8:00 AM) hoặc chiều mát (17:00 PM). Tránh tưới giữa trưa nắng vì sự chênh lệch nhiệt độ đột ngột dễ làm cây bị sốc nhiệt.';
      }

      const aiMsg = { id: Date.now() + 1, sender: 'ai', text: aiReply };
      setMessages((prev) => [...prev, aiMsg]);
    }, 800);
  };

  return (
    <div>
      <div className={styles.topBar}>
        <h1 className={styles.pageTitle}>PlantCare AI Assistant</h1>
        <p className={styles.pageSubtitle}>Trợ lý ảo tư vấn kỹ thuật chăm sóc cây trồng & chẩn đoán sức khỏe vườn</p>
      </div>

      <div className={styles.chatCard}>
        {/* Danh Sách Tin Nhắn */}
        <div className={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.messageRow} ${
                msg.sender === 'user' ? styles.userRow : styles.aiRow
              }`}
            >
              <div
                className={`${styles.avatar} ${
                  msg.sender === 'user' ? styles.userAvatar : styles.aiAvatar
                }`}
              >
                {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div
                className={`${styles.bubble} ${
                  msg.sender === 'user' ? styles.userBubble : styles.aiBubble
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Gợi Ý Câu Hỏi Nhanh */}
        <div className={styles.suggestionsBox}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Sparkles size={14} /> Gợi ý:
          </span>
          <button
            className={styles.chip}
            onClick={() => handleSendMessage('Cây bị vàng lá nên xử lý thế nào?')}
          >
            🍂 Cây bị vàng lá?
          </button>
          <button
            className={styles.chip}
            onClick={() => handleSendMessage('Độ ẩm đất bao nhiêu là tốt nhất?')}
          >
            💧 Độ ẩm đất tối ưu?
          </button>
          <button
            className={styles.chip}
            onClick={() => handleSendMessage('Nên đặt lịch tưới vào khung giờ nào?')}
          >
            ⏰ Lịch tưới phù hợp?
          </button>
        </div>

        {/* Ô Nhập Nhắn Tin */}
        <form
          className={styles.inputForm}
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="text"
            className={styles.input}
            placeholder="Hỏi AI về tình trạng cây trồng hoặc cách xử lý..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className={styles.sendBtn}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}