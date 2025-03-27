
import { Chatbot } from "../types/chatbot";

// Sample data - in a real app this would come from an API
const chatbots: Chatbot[] = [
  {
    id: "hospitality-1",
    name: "Hospitality",
    avatarColor: "#f3f4f6",
    uniqueUrl: "/chatbot/Hospitality/osrhz",
    gradient: {
      from: "#5e81ac",
      to: "#88c0d0",
    },
    createdAt: new Date("2023-09-15"),
    updatedAt: new Date("2023-10-20"),
  },
  {
    id: "qsr-pizza-1",
    name: "qsr-pizza",
    avatarColor: "#3b82f6",
    uniqueUrl: "/chatbot/qsr-pizza/om8ku",
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
    uniqueUrl: "/chatbot/Airlines/q11ho",
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
    uniqueUrl: "/chatbot/HRMS/i3vx5",
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
    uniqueUrl: "/chatbot/cars-dealers/csq81",
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
    uniqueUrl: "/chatbot/Testing/9ui3x",
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
