import { useState, useEffect, useRef } from 'react';
import { Send, Smile, Mic, ArrowLeft } from 'lucide-react';
import { LitoPet } from '../components/LitoPet';
import { useLitoStore } from '../store/litoStore';
import { analyzeEmotion, generateReply, mockChatMessages } from '../api/mockData';
import type { EmotionType, ChatMessage } from '../types';

interface ChatProps {
  onNavigate: (page: string) => void;
}

const emotionColors: Record<EmotionType, string> = {
  happy: 'bg-green-100 text-green-700',
  sad: 'bg-blue-100 text-blue-700',
  anxious: 'bg-yellow-100 text-yellow-700',
  angry: 'bg-red-100 text-red-700',
  calm: 'bg-teal-100 text-teal-700',
  neutral: 'bg-lito-dark/10 text-lito-dark/70',
};

const emotionLabels: Record<EmotionType, string> = {
  happy: '开心',
  sad: '难过',
  anxious: '焦虑',
  angry: '生气',
  calm: '平静',
  neutral: '平淡',
};

export const Chat = ({ onNavigate }: ChatProps) => {
  const { chatMessages, addChatMessage, setChatMessages, setUserEmotion, userEmotion } = useLitoStore();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages(mockChatMessages);
    }
  }, [chatMessages.length, setChatMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const { emotion, score } = analyzeEmotion(inputMessage);
    setUserEmotion(emotion as EmotionType);
    setIsTyping(true);

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'user1',
      message: inputMessage,
      reply: '',
      emotion: emotion as EmotionType,
      emotionScore: score,
      createdAt: new Date().toISOString(),
    };

    addChatMessage({ ...newMessage });
    setInputMessage('');

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const reply = generateReply(inputMessage, emotion);
    
    addChatMessage({ ...newMessage, reply });

    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="bg-gradient-to-r from-lito-beige via-lito-light to-lito-brown text-lito-dark py-4 px-6 shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('home')}
            className="p-2 rounded-full hover:bg-lito-dark/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <LitoPet emotion={userEmotion} size="small" />
            <div>
              <h1 className="text-lg font-display">与Lito聊天</h1>
              <p className="text-xs text-lito-dark/70">Lito正在倾听...</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-4">
        <div className="bg-white rounded-[2rem] p-4 shadow-xl min-h-[500px]">
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-lito-dark/50">
              <LitoPet emotion="happy" size="medium" />
              <p className="mt-4 font-display">快来和Lito聊天吧~</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className="flex justify-end">
                    <div className="flex flex-col items-end gap-1 max-w-[80%]">
                      <div className="bg-gradient-to-br from-coral/80 to-lito-ear/80 text-white px-4 py-3 rounded-2xl rounded-br-sm shadow-md">
                        {message.message}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${emotionColors[message.emotion]}`}>
                        {emotionLabels[message.emotion]}
                      </span>
                    </div>
                  </div>
                  {message.reply && (
                    <div className="flex justify-start">
                      <div className="flex flex-col items-start gap-1 max-w-[80%]">
                        <div className="flex items-center gap-2 mb-1">
                          <LitoPet emotion={message.emotion} size="small" />
                          <span className="text-xs text-lito-dark/60 font-medium">Lito</span>
                        </div>
                        <div className="bg-gradient-to-br from-lito-beige to-lito-light text-lito-dark px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-lito-dark/10">
                          {message.reply}
                        </div>
                      </div>
                    </div>
                  )}
                  {isTyping && message.id === chatMessages[chatMessages.length - 1]?.id && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2">
                        <LitoPet emotion="neutral" size="small" />
                        <div className="bg-lito-light/50 rounded-xl px-4 py-2">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-lito-dark/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-lito-dark/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-lito-dark/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-lito-dark/10 px-4 py-3">
        <div className="flex items-end gap-3 max-w-md mx-auto">
          <button className="p-2 rounded-full bg-lito-light/50 hover:bg-lito-light transition-colors">
            <Smile className="w-5 h-5 text-lito-dark/70" />
          </button>
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="和Lito说说你的心情..."
              rows={1}
              className="w-full bg-lito-light/30 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-coral/40 text-lito-dark placeholder:text-lito-dark/40"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button className="p-2 rounded-full bg-lito-light/50 hover:bg-lito-light transition-colors">
            <Mic className="w-5 h-5 text-lito-dark/70" />
          </button>
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isTyping}
            className={`p-3 rounded-full transition-all duration-300 shadow-md ${
              inputMessage.trim() && !isTyping
                ? 'bg-gradient-to-r from-lito-ear to-coral text-white hover:scale-110'
                : 'bg-lito-dark/20 text-lito-dark/40'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};