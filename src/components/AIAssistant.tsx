import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Bot, Send, X, Loader2 } from 'lucide-react';
import { AIService } from '../services/api/AIService';
import { useAuth } from '../hooks/useAuth';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const aiService = new AIService();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;

    const newMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, newMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await aiService.getAIResponse(message);
      
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      }]);

      // Save interaction for analytics
      await aiService.saveAIInsight(user.id, 'conversation', {
        query: message,
        response: response.message
      });
    } catch (error) {
      console.error('Error processing message:', error);
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${isOpen ? 'w-96' : 'w-auto'}`}>
      {/* Chat Window */}
      {isOpen && (
        <div className="modal-enter bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center">
              <Bot className="h-6 w-6 mr-2" />
              <h3 className="font-medium">AI Asistan</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-blue-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-enter`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <span className="text-xs opacity-75 mt-1 block">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start fade-enter">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Mesajınızı yazın..."
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isTyping}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTyping ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`hover-card bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    </div>
  );
}