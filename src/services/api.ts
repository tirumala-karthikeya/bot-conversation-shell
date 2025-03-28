import { Chatbot, ChatbotFormData } from "../types/chatbot";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// API client for chatbot operations
export const chatbotApi = {
  // Get all chatbots
  async getChatbots(): Promise<Chatbot[]> {
    try {
      console.log('Attempting to fetch chatbots from:', `${API_URL}/chatbots`);
      
      const response = await fetch(`${API_URL}/chatbots`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
  
      console.log('Fetch response status:', response.status);
      
      if (!response.ok) {
        // Try to get more error details
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Fetched chatbots:', data);
      
      return data.map((chatbot: any) => ({
        ...chatbot,
        createdAt: new Date(chatbot.createdAt),
        updatedAt: new Date(chatbot.updatedAt)
      }));
    } catch (error) {
      console.error('Comprehensive error fetching chatbots:', {
        errorName: error instanceof Error ? error.name : 'Unknown Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
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
      console.log('Attempting to create chatbot with data:', formData);
      const response = await fetch(`${API_URL}/chatbots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          avatarColor: formData.avatarColor,
          avatarInitial: formData.name.charAt(0).toUpperCase(),
          gradient: formData.gradient,
          chatLogoImage: formData.chatLogoImage || null,
          iconAvatarImage: formData.iconAvatarImage || null,
          staticImage: formData.staticImage || null,
          bodyBackgroundImage: formData.bodyBackgroundImage || null,
          chatHeaderColor: formData.chatHeaderColor || null,
          welcomeText: formData.welcomeText || null,
          apiKey: formData.apiKey || null,
          analyticsUrl: formData.analyticsUrl || null
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to create chatbot: ${errorText}`);
      }
      
      const chatbot = await response.json();
      console.log('Created chatbot:', chatbot);
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
      console.log('Updating chatbot with data:', { id, formData });
      
      const response = await fetch(`${API_URL}/chatbots/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update error response:', errorText);
        throw new Error(`Failed to update chatbot: ${errorText}`);
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
  async sendChatMessage(chatbotId: string, message: string, conversationId?: string) {
    const maxRetries = 3;
    let attempt = 0;
    let lastError;

    while (attempt < maxRetries) {
      try {
        const response = await axios.post(`${API_URL}/chatbots/${chatbotId}/chat`, {
          message,
          conversationId
        }, {
          timeout: 10000, // 10-second timeout
          validateStatus: (status) => status >= 200 && status < 300 // Only resolve for 2xx statuses
        });
        return response.data;
      } catch (error) {
        lastError = error;
        if (axios.isAxiosError(error)) {
          if (error.response) {
            console.error('Chat error response:', {
              status: error.response.status,
              data: error.response.data,
              headers: error.response.headers
            });
            if (error.response.status === 503) {
              console.warn('Service unavailable, retrying...');
              attempt++;
              await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt))); // Exponential backoff
              continue;
            }
            throw new Error(error.response.data.message || 'An unexpected error occurred');
          } else if (error.request) {
            console.error('No response received:', error.request);
            throw new Error('No response from the server. Please check your network connection.');
          } else {
            console.error('Error setting up request:', error.message);
            throw new Error('Error setting up the chat request');
          }
        }
        console.error('Unexpected chat error:', error);
        throw error;
      }
    }
    throw lastError || new Error('Failed to send chat message after multiple attempts.');
  }
};
