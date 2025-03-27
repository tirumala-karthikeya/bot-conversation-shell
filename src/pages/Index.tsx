
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getChatbots } from "@/services/chatbotService";
import ChatbotCard from "@/components/ChatbotCard";
import { Plus } from "lucide-react";
import CreateChatbotDialog from "@/components/CreateChatbotDialog";
import DashboardLayout from "@/components/DashboardLayout";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatbots, setChatbots] = useState(getChatbots());
  const [filteredChatbots, setFilteredChatbots] = useState(chatbots);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Update filtered bots when search query changes
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = chatbots.filter((bot) =>
      bot.name.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredChatbots(filtered);
  }, [searchQuery, chatbots]);

  // Refresh the chatbots list
  const refreshChatbots = () => {
    setChatbots(getChatbots());
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Open create dialog
  const handleCreateClick = () => {
    setIsCreateDialogOpen(true);
  };

  return (
    <DashboardLayout>
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

        {filteredChatbots.length === 0 ? (
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
                  onDelete={refreshChatbots}
                />
              </div>
            ))}
          </div>
        )}

        {/* Create New Chatbot Dialog */}
        <CreateChatbotDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSuccess={refreshChatbots}
        />
      </div>
    </DashboardLayout>
  );
};

export default Index;
