import React from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * ChatMessage Component
 * 
 * Why does this exist?
 * To render individual messages. It differentiates between 'user' messages (blue/teal bubble on the right)
 * and 'assistant' messages (dark glass bubble on the left).
 * For assistant messages, it uses `react-markdown` to parse the markdown string into actual HTML elements.
 */

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`ai-message ${isUser ? 'user' : 'assistant'}`}>
      <div className="ai-message-bubble">
        {isUser ? (
          // User messages are just plain text
          message.content
        ) : (
          // Assistant messages might contain markdown (bolding, lists, tables)
          <ReactMarkdown>{message.content}</ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
