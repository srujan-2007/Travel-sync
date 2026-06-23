import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useAIChat } from '../../context/AIChatContext';

/**
 * ChatInput Component
 * 
 * Why does this exist?
 * To capture user input and send it to the Context. It handles auto-resizing the textarea,
 * submitting on "Enter" (but allowing Shift+Enter for new lines), and provides suggested prompts.
 */

const ChatInput = () => {
  const [text, setText] = useState('');
  const { sendMessage, isLoading, messages } = useAIChat();
  const textareaRef = useRef(null);

  // Suggested prompts for empty states
  const suggestions = [
    "Plan a 3 day Goa trip",
    "Budget for Ooty",
    "Packing list for Manali",
    "Best places in Hyderabad"
  ];

  // Auto-resize the textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      sendMessage(text);
      setText(''); // Clear input after sending
    }
  };

  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  return (
    <div className="ai-chat-input-container">
      {/* Show suggestions only if it's the beginning of the conversation */}
      {messages.length === 0 && (
        <div className="ai-suggestions">
          {suggestions.map((sugg, index) => (
            <button 
              key={index} 
              className="ai-suggestion-chip"
              onClick={() => handleSuggestionClick(sugg)}
              disabled={isLoading}
            >
              {sugg}
            </button>
          ))}
        </div>
      )}

      <form className="ai-input-form" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          className="ai-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask TravelSync AI..."
          rows={1}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="ai-send-btn"
          disabled={!text.trim() || isLoading}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
