
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getChatbotById, updateChatbot, deleteChatbot } from "@/services/chatbotService";
import { ChevronLeft, Settings, Edit, QrCode, Trash2 } from "lucide-react";
import FloatingChat from "@/components/FloatingChat";
import EditChatbotDialog from "@/components/EditChatbotDialog";
import QRCodeDialog from "@/components/QRCodeDialog";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ChatbotDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chatbot, setChatbot] = useState(getChatbotById(id || ""));
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // Refresh chatbot data when id changes
    setChatbot(getChatbotById(id || ""));
  }, [id]);

  if (!chatbot) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Chatbot Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The chatbot you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/")} className="btn-transition">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Set background image if available
  const pageStyle = chatbot.bodyBackgroundImage ? {
    backgroundImage: `url(${chatbot.bodyBackgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } : {};

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleQRClick = () => {
    setIsQRDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateChatbot = (updatedChatbot: typeof chatbot) => {
    try {
      const updated = updateChatbot(updatedChatbot);
      setChatbot(updated);
      toast.success("Chatbot updated successfully");
      setIsEditDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update chatbot");
      console.error("Error updating chatbot:", error);
    }
  };

  const handleConfirmDelete = () => {
    try {
      deleteChatbot(chatbot.id);
      toast.success("Chatbot deleted successfully");
      setIsDeleteDialogOpen(false);
      navigate("/");
    } catch (error) {
      toast.error("Failed to delete chatbot");
      console.error("Error deleting chatbot:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={pageStyle}>
      <div 
        className="sticky top-0 z-10 border-b backdrop-blur-sm w-full bg-card/50 animate-fade-in"
        style={{ 
          backgroundImage: chatbot.gradient 
            ? `linear-gradient(to right, ${chatbot.gradient.from}10, ${chatbot.gradient.to}10)` 
            : undefined 
        }}
      >
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/")}
              className="hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden cursor-pointer"
                style={{ backgroundColor: chatbot.avatarColor }}
                onClick={() => navigate(`/chatbot/${chatbot.id}`)}
              >
                {chatbot.iconAvatarImage ? (
                  <img 
                    src={chatbot.iconAvatarImage} 
                    alt={chatbot.name} 
                    className="w-full h-full object-cover"
                  />
                ) : chatbot.chatLogoImage ? (
                  <img 
                    src={chatbot.chatLogoImage} 
                    alt={chatbot.name} 
                    className="w-full h-full object-contain p-1"
                  />
                ) : chatbot.avatarInitial ? (
                  <span className="text-sm font-semibold">{chatbot.avatarInitial}</span>
                ) : (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4" 
                    viewBox="0 0 24 24" 
                    stroke="#444" 
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                )}
              </div>
              <h1 className="text-xl font-semibold">{chatbot.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-white/20"
              onClick={handleEditClick}
              title="Edit Chatbot"
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-white/20"
              onClick={handleQRClick}
              title="Show QR Code"
            >
              <QrCode className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-white/20 text-red-500"
              onClick={handleDeleteClick}
              title="Delete Chatbot"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-white/20"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl animate-fade-in-up">
        {/* Static image display if available */}
        {chatbot.staticImage && (
          <div className="flex justify-center mb-8">
            <img 
              src={chatbot.staticImage} 
              alt={chatbot.name} 
              className="max-w-full rounded-lg shadow-md object-contain max-h-[300px]" 
            />
          </div>
        )}
      </main>

      {/* Floating Chat Component */}
      <FloatingChat 
        chatbotName={chatbot.name}
        headerColor={chatbot.chatHeaderColor}
        welcomeMessage={chatbot.welcomeText}
        backgroundGradient={chatbot.gradient}
        chatLogoImage={chatbot.chatLogoImage}
        iconAvatarImage={chatbot.iconAvatarImage}
        avatarColor={chatbot.avatarColor}
        apiKey={chatbot.apiKey}
      />

      {/* Edit Dialog */}
      <EditChatbotDialog
        chatbot={chatbot}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onUpdate={handleUpdateChatbot}
      />

      {/* QR Code Dialog */}
      <QRCodeDialog
        url={`/chatbot/${chatbot.id}`}
        title={chatbot.name}
        isOpen={isQRDialogOpen}
        onClose={() => setIsQRDialogOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${chatbot.name}`}
        description="Are you sure you want to delete this chatbot? This action cannot be undone."
      />
    </div>
  );
};

export default ChatbotDetail;
