// import MockProvider from './providers/MockProvider';
// import GeminiProvider from './providers/LegacyGeminiProvider';
import GroqProvider from './providers/GroqProvider';
import { getSystemPrompt } from './promptManager';

/**
 * AI Service
 * 
 * Why does this exist?
 * The aiService is the single point of contact for the frontend regarding anything AI.
 * It hides the complexity of which provider we are using. By swapping the provider here,
 * the entire application automatically starts using the new AI without changing any UI code.
 * 
 * How the request flows:
 * Component -> aiService -> GeminiProvider -> Backend API -> Google Generative AI
 */

class AIService {
  constructor() {
    // Dependency Injection: We inject the new GroqProvider.
    // If we ever need to switch back to Gemini, we just change this one line!
    this.provider = new GroqProvider();
  }

  /**
   * Generates a response from the AI

   * @param {string} prompt - The user's text
   * @param {Array} history - Previous messages for context
   * @param {string} sessionId - To maintain state if the provider requires it
   */
  async generateResponse(prompt, history = [], sessionId = 'default') {
    try {
      const systemPrompt = getSystemPrompt();
      
      // Delegate the actual work to the provider
      const response = await this.provider.generate(prompt, history, systemPrompt);
      return response;
    } catch (error) {
      console.error("AI Service Error:", error);
      throw new Error("Failed to communicate with AI Provider");
    }
  }
}

// Export a single instance (Singleton pattern) so the same service is shared across the app
export const aiService = new AIService();
