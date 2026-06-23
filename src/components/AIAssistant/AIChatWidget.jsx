import React from 'react';
import { MessageSquareText } from 'lucide-react';
import { useAIChat } from '../../context/AIChatContext';
import AIChatWindow from './AIChatWindow';
import { AnimatePresence } from 'framer-motion';
import './AIAssistant.css';

/**
 * AIChatWidget Component
 * 
 * Why does this exist?
 * This is the wrapper that sits in the corner of the screen.
 * It conditionally renders either the Floating Action Button (FAB) or the open Chat Window
 * based on the global state in `AIChatContext`.
 */

const AIChatWidget = () => {
  const { isOpen, toggleChat } = useAIChat();

  return (
    <div className="ai-assistant-wrapper">
      <AnimatePresence>
        {isOpen ? (
          <AIChatWindow />
        ) : (
          <button 
            className="ai-fab" 
            onClick={toggleChat}
            aria-label="Open AI Assistant"
          >
            <MessageSquareText size={28} />
          </button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatWidget;
