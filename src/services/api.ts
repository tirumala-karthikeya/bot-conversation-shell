
import { Chatbot, ChatbotFormData } from "../types/chatbot";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// API client for chatbot operations
export const chatbotApi = {
  // Get all chatbots
  async getChatbots(): Promise<Chatbot[]> {
    try {
      const response = await fetch(`${API_URL}/chatbots`);
      if (!response.ok) {
        throw new Error('Failed to fetch chatbots');
      }
      const data = await response.json();
      return data.map((chatbot: any) => ({
        ...chatbot,
        createdAt: new Date(chatbot.createdAt),
        updatedAt: new Date(chatbot.updatedAt)
      }));
    } catch (error) {
      console.error('Error fetching chatbots:', error);
      throw error;
    }
  },

  // Get chatbot by ID
  async getChatbotById(id: string): Promise<Chatbot> {
    try {
      const response = await fetch(`${API_URL}/chatbots/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chatbot');
      }
      const chatbot = await response.json();
      return {
        ...chatbot,
        createdAt: new Date(chatbot.createdAt),
        updatedAt: new Date(chatbot.updatedAt)
      };
    } catch (error) {
      console.error(`Error fetching chatbot ${id}:`, error);
      throw error;
    }
  },

  // Create a new chatbot
  async createChatbot(formData: ChatbotFormData): Promise<Chatbot> {
    try {
      const response = await fetch(`${API_URL}/chatbots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Failed to create chatbot');
      }
      const chatbot = await response.json();
      return {
        ...chatbot,
        createdAt: new Date(chatbot.createdAt),
        updatedAt: new Date(chatbot.updatedAt)
      };
    } catch (error) {
      console.error('Error creating chatbot:', error);
      throw error;
    }
  },

  // Update an existing chatbot
  async updateChatbot(id: string, formData: Partial<Chatbot>): Promise<Chatbot> {
    try {
      const response = await fetch(`${API_URL}/chatbots/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Failed to update chatbot');
      }
      const chatbot = await response.json();
      return {
        ...chatbot,
        createdAt: new Date(chatbot.createdAt),
        updatedAt: new Date(chatbot.updatedAt)
      };
    } catch (error) {
      console.error(`Error updating chatbot ${id}:`, error);
      throw error;
    }
  },

  // Delete a chatbot
  async deleteChatbot(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/chatbots/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete chatbot');
      }
      return true;
    } catch (error) {
      console.error(`Error deleting chatbot ${id}:`, error);
      throw error;
    }
  },

  // Send chat message using chatbot's API key
  async sendChatMessage(chatbotId: string, message: string, conversationId?: string): Promise<{
    answer: string;
    conversation_id: string;
  }> {
    try {
      const response = await fetch(`${API_URL}/chatbots/${chatbotId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }
};
