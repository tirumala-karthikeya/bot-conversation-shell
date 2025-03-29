import { Chatbot, ChatbotFormData } from "../types/chatbot";
import axios from "axios";

type ChatResponse = {
  answer: string;
  conversation_id: string;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const NEXT_AGI_BASE_URL = import.meta.env.VITE_NEXT_AGI_BASE_URL;
const NEXT_AGI_API_KEY = import.meta.env.VITE_NEXT_AGI_API_KEY;

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
  async sendChatMessage(chatbotId: string, message: string, conversationId?: string): Promise<ChatResponse> {
    try {
      const payload = {
        inputs: {},
        query: message,
        response_mode: "streaming",
        conversation_id: conversationId || "",
        user: "abc-123",
        files: []
      };

      const response = await fetch(`${NEXT_AGI_BASE_URL}/chat-messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NEXT_AGI_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "text/event-stream"
        },
        body: JSON.stringify(payload),
        duplex: "half"
      } as RequestInit);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error("Failed to get response reader");
      }
      
      let fullAnswer = "";
      let conversationIdFromResponse = conversationId || "";
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        text.split("\n").forEach((line) => {
          if (line.startsWith("data: ")) {
            try {
              const eventData = JSON.parse(line.slice(6));
              if (eventData.conversation_id) {
                conversationIdFromResponse = eventData.conversation_id;
              }
              if (eventData.answer) {
                fullAnswer += eventData.answer;
              }
            } catch (error) {
              console.error("Error parsing SSE event:", error);
            }
          }
        });
      }

      return {
        answer: fullAnswer,
        conversation_id: conversationIdFromResponse
      };

    } catch (error) {
      console.error("Unexpected chat error:", error);
      throw error;
    }
  }
};
