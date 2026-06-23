import React, { useRef, useEffect } from 'react';
import { X, Minimize2, Trash2 } from 'lucide-react';
import { useAIChat } from '../../context/AIChatContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AIChatWindow Component
 * 
 * Why does this exist?
 * It serves as the main visual container for the chat interface. It manages the header,
 * maps over the `messages` array to render `ChatMessage`s, and auto-scrolls to the bottom
 * whenever a new message is added.
 */

const AIChatWindow = () => {
  const { messages, isLoading, toggleChat, clearChat } = useAIChat();
  
  // We use a ref to target the bottom of the message list for auto-scrolling
  const messagesEndRef = useRef(null);

  // Auto-scroll effect: runs every time the `messages` array or `isLoading` changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <motion.div 
      className="ai-chat-window"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Chat Header */}
      <div className="ai-chat-header">
        <h3>✨ TravelSync AI</h3>
        <div className="ai-chat-controls">
          <button onClick={clearChat} title="Clear Chat">
            <Trash2 size={16} />
          </button>
          <button onClick={toggleChat} title="Minimize">
            <Minimize2 size={16} />
          </button>
          <button onClick={toggleChat} title="Close">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="ai-messages-container">
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '2rem' }}>
            <p>👋 Hello! I'm your AI travel assistant.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Ask me about destinations, budgets, or packing lists!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="ai-message assistant">
            <div className="ai-message-bubble ai-typing-indicator">
              <div className="ai-dot"></div>
              <div className="ai-dot"></div>
              <div className="ai-dot"></div>
            </div>
          </div>
        )}
        
        {/* Invisible div to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput />
    </motion.div>
  );
};

export default AIChatWindow;
