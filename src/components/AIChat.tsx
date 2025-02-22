import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Brain } from 'lucide-react';

interface Message {
  type: 'ai' | 'user';
  content: string;
}

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'ai',
      content: 'Merhaba! Ben sizin kişisel öğrenme asistanınızım. Size nasıl yardımcı olabilirim?'
    }
  ]);
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const generateAIResponse = (message: string): string => {
    const lowercaseMsg = message.toLowerCase();
    
    // Daha gelişmiş yanıt sistemi
    const responses = {
      // Öğrenme ve Kurs Önerileri
      kurs: {
        match: (msg: string) => msg.includes('kurs') || msg.includes('öğren') || msg.includes('eğitim'),
        response: (msg: string) => {
          if (msg.includes('python') || msg.includes('yapay zeka')) {
            return 'Python ve Yapay Zeka öğrenmek için size özel bir yol haritası oluşturabilirim:\n1. Python Temelleri (4 haftalık)\n2. Veri Bilimi Araçları (4 haftalık)\n3. Makine Öğrenmesi (6 haftalık)\n4. Derin Öğrenme (8 haftalık)\n\nHangi seviyeden başlamak istersiniz?';
          }
          if (msg.includes('web') || msg.includes('frontend')) {
            return 'Web geliştirme için güncel yol haritası:\n1. Modern JavaScript (ES6+)\n2. React ve State Yönetimi\n3. TypeScript ile Güvenli Kod\n4. Next.js ile SSR\n\nAyrıca şu kursları önerebilirim:\n- Advanced React Patterns\n- Modern Web Architecture\n- UI/UX Best Practices';
          }
          return 'Öğrenme hedeflerinize göre size özel kurs önerileri:\n1. Frontend Development Path\n2. Backend Development Path\n3. Full Stack Development\n4. DevOps & Cloud Computing\n\nHangi alan ilginizi çekiyor?';
        }
      },

      // İlerleme ve Analiz
      ilerleme: {
        match: (msg: string) => msg.includes('ilerleme') || msg.includes('durum') || msg.includes('analiz'),
        response: () => {
          const progress = {
            haftalık: 75,
            aylık: 85,
            tamamlanan: 24,
            saat: 128,
            rozet: 12
          };
          
          return `İlerleme Analiziniz:\n
• Son 7 günde %${progress.haftalık} hedef tamamlama
• Bu ay ${progress.tamamlanan} eğitim tamamladınız
• Toplam ${progress.saat} saat öğrenme süresi
• ${progress.rozet} rozet kazandınız
\nÖnerim: Günlük öğrenme sürenizi %15 artırarak hedeflerinize daha hızlı ulaşabilirsiniz. Size özel bir çalışma planı oluşturmamı ister misiniz?`;
        }
      },

      // Hedef Belirleme ve Planlama
      hedef: {
        match: (msg: string) => msg.includes('hedef') || msg.includes('plan') || msg.includes('amaç'),
        response: (msg: string) => {
          if (msg.includes('kariyer') || msg.includes('iş')) {
            return 'Kariyer hedefleriniz için size özel yol haritası:\n1. Technical Skills Gap Analysis\n2. Soft Skills Development\n3. Portfolio Building\n4. Interview Preparation\n\nHangi alanda ilerlemek istiyorsunuz?';
          }
          return 'Hedeflerinizi SMART kriterlere göre belirleyelim:\n1. Specific (Belirli)\n2. Measurable (Ölçülebilir)\n3. Achievable (Ulaşılabilir)\n4. Relevant (İlgili)\n5. Time-bound (Zamana Bağlı)\n\nHedeflerinizi bu kriterlere göre belirlememde size yardımcı olabilirim.';
        }
      },

      // Teknik Destek ve Problem Çözme
      problem: {
        match: (msg: string) => msg.includes('hata') || msg.includes('sorun') || msg.includes('problem') || msg.includes('yardım'),
        response: (msg: string) => {
          if (msg.includes('hata')) {
            return 'Sorunu çözmek için şu adımları izleyelim:\n1. Hata mesajını analiz edelim\n2. Debug modunda çalıştıralım\n3. Çözüm önerilerini deneyelim\n\nHata mesajını paylaşır mısınız?';
          }
          return 'Size nasıl yardımcı olabilirim?\n1. Teknik destek\n2. Kod review\n3. Best practices önerileri\n4. Debug yardımı\n5. Performans optimizasyonu';
        }
      },

      // Motivasyon ve Başarı Hikayeleri
      motivasyon: {
        match: (msg: string) => msg.includes('motivasyon') || msg.includes('sıkıldım') || msg.includes('zor'),
        response: () => {
          const tips = [
            'Her gün küçük adımlar büyük başarılara yol açar',
            'Zorluklar sizi daha güçlü yapar',
            'Hedefe odaklanın, sürece güvenin',
            'Başarılı geliştiriciler de aynı yollardan geçti'
          ];
          return `Motivasyon İpuçları:\n${tips.join('\n')}\n\nAyrıca size özel bir başarı hikayesi paylaşmamı ister misiniz?`;
        }
      },

      // Öğrenme Teknikleri
      teknik: {
        match: (msg: string) => msg.includes('nasıl') || msg.includes('yöntem') || msg.includes('teknik'),
        response: (msg: string) => {
          const techniques = {
            programlama: 'Programlama öğrenme teknikleri:\n1. Pomodoro Tekniği\n2. Active Recall\n3. Spaced Repetition\n4. Project-Based Learning',
            dil: 'Yeni bir programlama dili öğrenme teknikleri:\n1. Syntax Comparison\n2. Small Projects\n3. Code Reading\n4. Pair Programming',
            algoritma: 'Algoritma öğrenme teknikleri:\n1. Visualization\n2. Pseudocode Writing\n3. Time Complexity Analysis\n4. Pattern Recognition'
          };
          
          if (msg.includes('programlama')) return techniques.programlama;
          if (msg.includes('dil')) return techniques.dil;
          if (msg.includes('algoritma')) return techniques.algoritma;
          
          return 'Size en uygun öğrenme tekniğini belirleyelim. Hangi konuda zorlanıyorsunuz?';
        }
      },

      // Varsayılan Yanıt
      default: {
        match: () => true,
        response: () => 'Anladım. Size daha iyi yardımcı olabilmem için lütfen şu konulardan birini seçin:\n1. Kurs önerileri\n2. İlerleme analizi\n3. Hedef belirleme\n4. Teknik destek\n5. Motivasyon\n6. Öğrenme teknikleri'
      }
    };

    // Mesajı analiz et ve en uygun yanıtı seç
    for (const category of Object.values(responses)) {
      if (category.match(lowercaseMsg)) {
        return category.response(lowercaseMsg);
      }
    }

    return responses.default.response(lowercaseMsg);
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    setMessages(prev => [...prev, { type: 'user', content: chatMessage }]);
    setChatMessage('');
    setIsTyping(true);

    // AI yanıtını simüle ediyoruz
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        type: 'ai',
        content: generateAIResponse(chatMessage)
      }]);
    }, 1500);

    if (!isOpen) {
      setHasNewMessage(true);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
    }
  };

  return (
    <div className="ai-chat-widget">
      {isOpen && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6" />
              <h2 className="text-lg font-semibold">AI Öğrenme Asistanı</h2>
            </div>
            <button 
              onClick={toggleChat}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="ai-chat-messages" ref={chatRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`${msg.type === 'ai' ? 'ai-message' : 'user-message'}`}>
                <p>{msg.content}</p>
              </div>
            ))}
            {isTyping && (
              <div className="ai-message typing">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            )}
          </div>
          
          <div className="ai-chat-input">
            <div className="input-container">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Mesajınızı yazın..."
                className="chat-input"
              />
              <button onClick={handleSendMessage} className="send-button">
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      <button onClick={toggleChat} className="ai-chat-toggle">
        {hasNewMessage && <span className="notification">1</span>}
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
};

export default AIChat;
