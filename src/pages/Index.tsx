
import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ChatbotCard from "@/components/ChatbotCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getChatbots } from "@/services/chatbotService";
import { PlusCircle, Search } from "lucide-react";

const Index = () => {
  const chatbots = getChatbots();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChatbots = chatbots.filter(
    (chatbot) =>
      chatbot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chatbot.uniqueUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight animate-fade-in-up">
          My Chatbots
        </h2>
        <p className="text-muted-foreground mt-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Manage and monitor all your chatbots from a single dashboard.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search chatbots..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button className="gap-2 btn-transition">
          <PlusCircle className="h-4 w-4" />
          New Chatbot
        </Button>
      </div>

      {filteredChatbots.length === 0 ? (
        <div className="text-center py-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <Search className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No chatbots found</h3>
          <p className="text-muted-foreground mb-6">
            We couldn't find any chatbots matching your search criteria.
          </p>
          <Button className="gap-2 btn-transition">
            <PlusCircle className="h-4 w-4" />
            Create New Chatbot
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChatbots.map((chatbot, index) => (
            <div 
              key={chatbot.id} 
              className="animate-fade-in-up"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <ChatbotCard chatbot={chatbot} />
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Index;
