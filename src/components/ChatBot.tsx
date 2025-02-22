import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X } from 'lucide-react';
import OpenAI from 'openai';
import { db } from '../lib/supabase';

const baseURL = "https://api.aimlapi.com/v1";
const apiKey = "946912f3fb134d389b8cc1db60d07d99";

const api = new OpenAI({
  apiKey,
  baseURL,
  dangerouslyAllowBrowser: true
});

// Test için kullanıcı ID'si (normalde auth sisteminden gelecek)
const currentUserId = '33333333-3333-3333-3333-333333333333';

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Oturum ve mesajları yükle
  useEffect(() => {
    if (isOpen) {
      const initializeChat = async () => {
        try {
          // Yeni oturum oluştur
          if (!currentSessionId) {
            const session = await db.chat.createSession(
              currentUserId,
              'Yeni Sohbet',
              currentCourseId,
              currentLessonId
            );
            setCurrentSessionId(session.id);

            // Hoşgeldin mesajını ekle
            const welcomeMessage = await db.chat.addMessage(
              session.id,
              'Merhaba! Ben AR Eğitim Asistanı. Size nasıl yardımcı olabilirim?',
              'bot',
              currentUserId
            );
            setMessages([welcomeMessage]);
          } else {
            // Mevcut mesajları yükle
            const existingMessages = await db.chat.getMessages(currentSessionId);
            setMessages(existingMessages);
          }
        } catch (error) {
          console.error('Chat başlatma hatası:', error);
        }
      };

      initializeChat();
    }
  }, [isOpen, currentSessionId, currentCourseId, currentLessonId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const callChatGPT = async (prompt: string) => {
    // Eğer ders bağlamı varsa, sistem mesajına ekle
    let systemMessage = "Sen bir eğitim asistanısın. Türkçe cevap ver.";
    
    if (currentCourseId && currentLessonId) {
      try {
        const [course, lesson] = await Promise.all([
          db.courses.getById(currentCourseId),
          db.lessons.getByCourse(currentCourseId)
        ]);
        
        if (course && lesson) {
          systemMessage += ` Şu anda '${course.title}' kursunun '${lesson[0].title}' dersinde yardımcı oluyorsun.`;
        }
      } catch (error) {
        console.error('Ders bilgisi alma hatası:', error);
      }
    }

    const completion = await api.chat.completions.create({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 256
    });

    return completion.choices[0].message.content;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentSessionId) return;

    setIsLoading(true);

    try {
      // Kullanıcı mesajını kaydet
      const userMessage = await db.chat.addMessage(
        currentSessionId,
        input,
        'user',
        currentUserId
      );
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      // Bot yanıtını al ve kaydet
      const response = await callChatGPT(input);
      const botMessage = await db.chat.addMessage(
        currentSessionId,
        response,
        'bot',
        currentUserId
      );
      setMessages(prev => [...prev, botMessage]);

      // Kullanıcının dersi tamamladıysa ilerlemeyi güncelle
      if (currentLessonId) {
        await db.progress.updateProgress(currentUserId, currentLessonId, {
          completed: true,
          last_position_seconds: 0
        });
      }
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      const errorMessage = await db.chat.addMessage(
        currentSessionId,
        'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        'bot',
        currentUserId
      );
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {!isOpen ? (
        <div 
          className="chatbot-icon bounce-animation" 
          onClick={() => setIsOpen(true)}
        >
          <Bot size={40} className="animate-bounce-slow" />
        </div>
      ) : (
        <div className={`chatbot-window ${isClosing ? 'closing' : 'opening'}`}>
          <div className="chatbot-header">
            <h3>AR Eğitim Asistanı</h3>
            <button onClick={handleClose}><X size={20} /></button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div 
                key={msg.id} 
                className={`message ${msg.type === 'user' ? 'user-message' : 'bot-message'} fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {msg.type === 'bot' ? <Bot size={20} /> : <User size={20} />}
                <p>{msg.content}</p>
              </div>
            ))}
            {isLoading && (
              <div className="message bot-message typing-animation">
                <Bot size={20} />
                <p>
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="chatbot-input">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bir soru sormak için yazın..."
              disabled={isLoading}
              className="slide-up"
            />
            <button type="submit" disabled={isLoading} className="pulse-animation">
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
