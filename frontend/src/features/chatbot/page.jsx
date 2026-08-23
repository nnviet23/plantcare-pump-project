import React, { useState, useRef, useEffect, useContext } from 'react';
import styles from './chatbot.module.css';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import api from '../../services/realtimeApi';
import { AuthContext } from '../../context/AuthContext';

export default function ChatbotPage() {
  const { user } = useContext(AuthContext);
  const userName = user?.username || 'Tainbow';

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Xin chào ${userName}! Tôi là Trợ lý AI PlantCare. Tôi có thể giúp gì cho vườn cây của bạn hôm nay?`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Gửi câu hỏi đến Gemini AI API thông qua Backend
  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim() || isThinking) return;

    // 1. Thêm tin nhắn của người dùng vào giao diện
    const userMsg = { id: Date.now(), sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      // 2. Gọi API Chatbot từ Backend
      const response = await api.post('/chatbot/ask', { message: query });

      if (response.data.success) {
        const aiMsg = {
          id: Date.now() + 1,
          sender: 'ai',
          text: response.data.reply,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('Không nhận được phản hồi từ Trợ lý AI');
      }
    } catch (error) {
      console.error('Lỗi kết nối AI Gemini:', error);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Rất tiếc, hệ thống đang gặp sự cố khi kết nối tới Trợ lý AI. Vui lòng kiểm tra lại mạng hoặc thử lại sau ít phút!',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
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

          {/* Trạng thái AI đang suy nghĩ */}
          {isThinking && (
            <div className={`${styles.messageRow} ${styles.aiRow}`}>
              <div className={`${styles.avatar} ${styles.aiAvatar}`}>
                <Bot size={18} />
              </div>
              <div className={`${styles.bubble} ${styles.aiBubble}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                <Loader2 size={16} className="animate-spin" />
                <span>PlantCare AI đang phân tích dữ liệu vườn...</span>
              </div>
            </div>
          )}

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
            disabled={isThinking}
          >
            🍂 Cây bị vàng lá?
          </button>
          <button
            className={styles.chip}
            onClick={() => handleSendMessage('Độ ẩm đất bao nhiêu là tốt nhất?')}
            disabled={isThinking}
          >
            💧 Độ ẩm đất tối ưu?
          </button>
          <button
            className={styles.chip}
            onClick={() => handleSendMessage('Nên đặt lịch tưới vào khung giờ nào?')}
            disabled={isThinking}
          >
            ⏰ Lịch tưới phù hợp?
          </button>
        </div>

        {/* Ô Nhập Tin Nhắn */}
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
            disabled={isThinking}
          />
          <button type="submit" className={styles.sendBtn} disabled={isThinking || !inputText.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}