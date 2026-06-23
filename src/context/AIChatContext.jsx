import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { aiService } from '../services/ai/aiService';

/**
 * AIChatContext
 * 
 * Why does this exist?
 * In React, passing data down multiple levels of components (prop drilling) can be messy.
 * The Context API allows us to manage global state (like chat history, whether the chat is open, 
 * and loading states) in one central place. Any component can access this state using the 
 * custom `useAIChat` hook without needing props passed directly to it.
 */

// 1. Create the Context object
const AIChatContext = createContext();

// 2. Custom hook for easier access to the context
export const useAIChat = () => {
  return useContext(AIChatContext);
};

import { useAuth } from './AuthContext';

// 3. Provider Component that wraps the application
export const AIChatProvider = ({ children }) => {
  // Use Auth context to detect user changes
  const { currentUser } = useAuth();

  // State to track if the chat window is visible
  const [isOpen, setIsOpen] = useState(false);
  
  // State to hold the array of messages. 
  // Each message is an object: { role: 'user' | 'assistant', content: '...', id: '...' }
  const [messages, setMessages] = useState([]);
  
  // State to show the typing animation while waiting for a response
  const [isLoading, setIsLoading] = useState(false);
  
  // We use a ref to store the current session ID. 
  // useRef is perfect here because updating it doesn't trigger a re-render.
  const sessionIdRef = useRef(`session_${Date.now()}`);

  /**
   * Toggles the chat window open/closed
   */
  const toggleChat = () => setIsOpen(prev => !prev);

  /**
   * Clears the chat history
   */
  const clearChat = () => {
    setMessages([]);
    sessionIdRef.current = `session_${Date.now()}`; // Start a new session
  };

  // Clear chat history when user logs in or out to ensure isolation
  useEffect(() => {
    clearChat();
  }, [currentUser?._id]);

  /**
   * Sends a message to the AI
   * This is an async function because we need to wait for the network (or mock provider) response.
   * 
   * Data Flow:
   * 1. User types message -> hits send in ChatInput.
   * 2. ChatInput calls `sendMessage(text)`.
   * 3. We update state with the user's message immediately for a snappy UI.
   * 4. We set `isLoading` to true to show the typing indicator.
   * 5. We call the `aiService`, which talks to the MockProvider (and later Gemini/OpenAI).
   * 6. We get the response back, append it to `messages`, and set `isLoading` to false.
   */
  const sendMessage = async (content) => {
    if (!content.trim()) return;

    // Create the new user message object
    const newUserMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim()
    };

    // Update the UI immediately with the user's message
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true); // Start typing animation

    try {
      // Build the conversation history context for the AI
      // The AI needs to know what was said previously to maintain a coherent conversation
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Send to the service
      const responseText = await aiService.generateResponse(
        content.trim(),
        conversationHistory,
        sessionIdRef.current
      );

      // Create the assistant's message object
      const newAssistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText
      };

      // Add the response to the UI
      setMessages(prev => [...prev, newAssistantMsg]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      // Fallback error message in case of failure
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later."
      }]);
    } finally {
      setIsLoading(false); // Stop typing animation regardless of success/failure
    }
  };

  // The value object contains all state and functions we want to expose to our app
  const value = {
    isOpen,
    setIsOpen,
    toggleChat,
    messages,
    isLoading,
    sendMessage,
    clearChat
  };

  return (
    <AIChatContext.Provider value={value}>
      {children}
    </AIChatContext.Provider>
  );
};
