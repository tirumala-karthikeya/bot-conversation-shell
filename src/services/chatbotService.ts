
import { Chatbot, ChatbotFormData } from "../types/chatbot";

// Sample data - in a real app this would come from an API
let chatbots: Chatbot[] = [
  {
    id: "hospitality-1",
    name: "Hospitality",
    avatarColor: "#f3f4f6",
    uniqueUrl: "/chatbot/hospitality-1",
    gradient: {
      from: "#5e81ac",
      to: "#88c0d0",
    },
    createdAt: new Date("2023-09-15"),
    updatedAt: new Date("2023-10-20"),
    chatHeaderColor: "#b4c7c5",
    welcomeText: "Hi, this is Ama, your dedicated hotel assistant! How may I assist you today?"
  },
  {
    id: "qsr-pizza-1",
    name: "qsr-pizza",
    avatarColor: "#3b82f6",
    uniqueUrl: "/chatbot/qsr-pizza-1",
    gradient: {
      from: "#3b82f6",
      to: "#60a5fa",
    },
    createdAt: new Date("2023-08-10"),
    updatedAt: new Date("2023-10-22"),
  },
  {
    id: "airlines-1",
    name: "Airlines",
    avatarColor: "#f3f4f6",
    uniqueUrl: "/chatbot/airlines-1",
    gradient: {
      from: "#4c1d95",
      to: "#8b5cf6",
    },
    createdAt: new Date("2023-07-05"),
    updatedAt: new Date("2023-10-15"),
  },
  {
    id: "hrms-1",
    name: "HRMS",
    avatarColor: "#fb923c",
    uniqueUrl: "/chatbot/hrms-1",
    gradient: {
      from: "#ea580c",
      to: "#fb923c",
    },
    createdAt: new Date("2023-06-20"),
    updatedAt: new Date("2023-10-10"),
  },
  {
    id: "cars-dealers-1",
    name: "cars-dealers",
    avatarColor: "#f3f4f6",
    uniqueUrl: "/chatbot/cars-dealers-1",
    gradient: {
      from: "#0891b2",
      to: "#22d3ee",
    },
    createdAt: new Date("2023-05-15"),
    updatedAt: new Date("2023-10-05"),
  },
  {
    id: "testing-1",
    name: "Testing",
    avatarColor: "#3b82f6",
    avatarInitial: "T",
    uniqueUrl: "/chatbot/testing-1",
    gradient: {
      from: "#2563eb",
      to: "#3b82f6",
    },
    createdAt: new Date("2023-04-10"),
    updatedAt: new Date("2023-10-01"),
  },
];

export const getChatbots = (): Chatbot[] => {
  return chatbots;
};

export const getChatbotById = (id: string): Chatbot | undefined => {
  return chatbots.find((chatbot) => chatbot.id === id);
};

export const updateChatbot = (updatedChatbot: Chatbot): Chatbot => {
  const index = chatbots.findIndex((chatbot) => chatbot.id === updatedChatbot.id);
  
  if (index !== -1) {
    // Update the updatedAt date
    updatedChatbot.updatedAt = new Date();
    
    // Replace the chatbot in the array
    chatbots[index] = updatedChatbot;
    return updatedChatbot;
  }
  
  throw new Error("Chatbot not found");
};

export const deleteChatbot = (id: string): boolean => {
  const initialLength = chatbots.length;
  chatbots = chatbots.filter((chatbot) => chatbot.id !== id);
  return chatbots.length < initialLength;
};

export const createChatbot = (formData: ChatbotFormData): Chatbot => {
  // Generate a simple ID based on name and timestamp
  const id = `${formData.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString(36)}`;
  
  // Create the new chatbot
  const newChatbot: Chatbot = {
    id,
    name: formData.name,
    avatarColor: formData.avatarColor,
    uniqueUrl: `/chatbot/${id}`,
    gradient: formData.gradient,
    createdAt: new Date(),
    updatedAt: new Date(),
    chatLogoImage: formData.chatLogoImage,
    iconAvatarImage: formData.iconAvatarImage,
    staticImage: formData.staticImage,
    bodyBackgroundImage: formData.bodyBackgroundImage,
    chatHeaderColor: formData.chatHeaderColor,
    welcomeText: formData.welcomeText,
    apiKey: formData.apiKey,
    analyticsUrl: formData.analyticsUrl
  };
  
  // Add to the array
  chatbots.push(newChatbot);
  
  return newChatbot;
};
