import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { askBot } from '../services/gemini';

export default function HelpBot() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Welcome to Quester. How may I assist you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  if (location.pathname.includes('/navigate')) return null;

  const handleSend = async () => {
    if (!input.trim() || isSleeping) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    const response = await askBot(userText);

    setIsLoading(false);

    if (response?.error === 'sleeping') {
      setIsSleeping(true);
      setMessages(prev => [...prev, { role: 'bot', text: "I am currently unavailable. Please try again later." }]);
    } else {
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end space-y-4">
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-80 bg-slate-900 border border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col backdrop-blur-xl"
            style={{ maxHeight: '500px', height: '450px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-white/5 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-[#fcd34d]/10 p-1.5 rounded-full border border-[#fcd34d]/20">
                  <HelpCircle className="w-5 h-5 text-[#fcd34d]" />
                </div>
                <div>
                  <h3 className="text-slate-100 font-serif font-bold text-sm tracking-wide">Concierge</h3>
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest">Always at your service</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#020617]/50">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 text-sm shadow-lg ${
                      msg.role === 'user' 
                        ? 'bg-[#fcd34d] text-slate-900 rounded-2xl rounded-tr-none font-medium' 
                        : 'bg-white/10 text-slate-200 rounded-2xl rounded-tl-none border border-white/5 backdrop-blur-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none border border-white/5 flex space-x-1">
                    <motion.div 
                      animate={{ y: [0, -5, 0] }} 
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full" 
                    />
                    <motion.div 
                      animate={{ y: [0, -5, 0] }} 
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full" 
                    />
                    <motion.div 
                      animate={{ y: [0, -5, 0] }} 
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="w-1.5 h-1.5 bg-slate-400 rounded-full" 
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-slate-900 border-t border-white/5">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSleeping || isLoading}
                  placeholder={isSleeping ? "Unavailable..." : "Type your request..."}
                  className="w-full pl-4 pr-10 py-2.5 bg-white/5 text-slate-200 rounded-full text-sm border border-white/10 focus:outline-none focus:border-[#fcd34d]/50 focus:bg-white/10 transition-all placeholder-slate-600"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isSleeping || isLoading}
                  className="absolute right-2 p-1.5 bg-[#fcd34d] text-slate-900 rounded-full hover:bg-[#fcd34d]/90 disabled:opacity-50 disabled:hover:bg-[#fcd34d] transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#fcd34d] hover:bg-[#fcd34d]/90 text-slate-900 p-4 rounded-full shadow-2xl hover:shadow-[#fcd34d]/20 transition-all duration-300 group border border-white/10"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </motion.button>
    </div>
  );
}
