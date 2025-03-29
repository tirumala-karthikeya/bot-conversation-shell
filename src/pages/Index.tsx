import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatbotApi } from "@/services/api";
import ChatbotCard from "@/components/ChatbotCard";
import { Plus } from "lucide-react";
import CreateChatbotDialog from "@/components/CreateChatbotDialog";
import {DashboardLayout}  from "@/components/DashboardLayout";
import { Chatbot } from "@/types/chatbot";
import { toast } from "sonner";
import FloatingChat from "@/components/FloatingChat";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [filteredChatbots, setFilteredChatbots] = useState<Chatbot[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch chatbots from API
  const fetchChatbots = async () => {
    try {
      setIsLoading(true);
      const data = await chatbotApi.getChatbots();
      setChatbots(data);
    } catch (error) {
      console.error("Error fetching chatbots:", error);
      toast.error("Failed to load chatbots");
    } finally {
      setIsLoading(false);
    }
  };

  // Load chatbots on component mount
  useEffect(() => {
    fetchChatbots();
  }, []);

  // Update filtered bots when search query changes
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = chatbots.filter((bot) =>
      bot.name.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredChatbots(filtered);
  }, [searchQuery, chatbots]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Open create dialog
  const handleCreateClick = () => {
    setIsCreateDialogOpen(true);
  };

  // Refresh chatbots after create/update/delete
  const handleChatbotChange = () => {
    fetchChatbots();
  };

  const handleBotCreated = () => {
    fetchChatbots(); // Refresh the list when a new bot is created
  };

  return (
    <DashboardLayout onBotCreated={handleBotCreated}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold">Your Agents</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full md:w-64 animate-fade-in"
              style={{animationDelay: "100ms"}}
            />
            <Button
              onClick={handleCreateClick}
              className="flex items-center gap-2 animate-fade-in btn-transition"
              style={{animationDelay: "200ms"}}
            >
              <Plus className="h-5 w-5" />
              Create New Bot
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredChatbots.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg animate-fade-in-up">
            <h2 className="text-xl font-semibold mb-2">No agents found</h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "No agents match your search criteria."
                : "You haven't created any agents yet."}
            </p>
            <Button onClick={handleCreateClick} className="animate-pulse-subtle">Create Your First Bot</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChatbots.map((chatbot, index) => (
              <div 
                key={chatbot.id} 
                className="animate-fade-in-up" 
                style={{animationDelay: `${index * 50}ms`}}
              >
                <ChatbotCard
                  chatbot={chatbot}
                  onDelete={handleChatbotChange}
                />
              </div>
            ))}
          </div>
        )}

        {/* Create New Chatbot Dialog */}
        <CreateChatbotDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSuccess={handleChatbotChange}
        />

        {/* Floating Chat Component */}
        <FloatingChat 
          chatbotId="demo-bot"
          chatbotName="Demo Assistant"
          headerColor="#3b82f6"
          welcomeMessage="Hello! I'm your demo assistant. How can I help you today?"
          backgroundGradient={{
            from: "#3b82f6",
            to: "#60a5fa"
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default Index;
