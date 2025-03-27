
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Chatbot } from "@/types/chatbot";
import { Edit, QrCode, BarChart, Trash2, ExternalLink } from "lucide-react";
import { deleteChatbot, updateChatbot } from "@/services/chatbotService";
import EditChatbotDialog from "./EditChatbotDialog";
import QRCodeDialog from "./QRCodeDialog";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import { toast } from "sonner";

interface ChatbotCardProps {
  chatbot: Chatbot;
  onDelete?: () => void;
}

const ChatbotCard: React.FC<ChatbotCardProps> = ({ chatbot, onDelete }) => {
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Function to create avatar with initial or custom style
  const renderAvatar = () => {
    if (chatbot.iconAvatarImage) {
      return (
        <div 
          className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center avatar-transition"
          style={{ 
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
          }}
        >
          <img 
            src={chatbot.iconAvatarImage} 
            alt={chatbot.name} 
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else if (chatbot.avatarInitial) {
      return (
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold avatar-transition"
          style={{ 
            backgroundColor: chatbot.avatarColor,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
          }}
        >
          {chatbot.avatarInitial}
        </div>
      );
    } else if (chatbot.chatLogoImage) {
      return (
        <div 
          className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center avatar-transition"
          style={{ 
            backgroundColor: chatbot.avatarColor,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
          }}
        >
          <img 
            src={chatbot.chatLogoImage} 
            alt={chatbot.name} 
            className="w-full h-full object-contain p-2"
          />
        </div>
      );
    } else {
      return (
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center avatar-transition"
          style={{ 
            backgroundColor: chatbot.avatarColor,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
          }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-8 w-8" 
            viewBox="0 0 24 24" 
            stroke="#444" 
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
      );
    }
  };

  const handleLaunch = () => {
    navigate(`/chatbot/${chatbot.id}`);
  };

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleQRClick = () => {
    setIsQRDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateChatbot = (updatedChatbot: Chatbot) => {
    try {
      updateChatbot(updatedChatbot);
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
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      toast.error("Failed to delete chatbot");
      console.error("Error deleting chatbot:", error);
    }
  };

  return (
    <>
      <Card className="bg-white h-full flex flex-col overflow-hidden bot-card">
        <CardContent className="pt-6 pb-0 flex flex-col items-center">
          {renderAvatar()}
          <h3 className="text-xl font-semibold mt-4 mb-2">{chatbot.name}</h3>
          
          <div className="text-xs text-muted-foreground mb-2 text-center">
            <p className="font-medium">Unique URL:</p>
            <p className="truncate max-w-[16rem]">{chatbot.uniqueUrl}</p>
          </div>
          
          <div className="w-full mt-2">
            <p className="text-xs font-medium text-muted-foreground">
              Header:
            </p>
            <div 
              className="w-full h-2 mt-1 rounded" 
              style={{ 
                background: chatbot.gradient 
                  ? `linear-gradient(to right, ${chatbot.gradient.from}, ${chatbot.gradient.to})` 
                  : chatbot.avatarColor 
              }} 
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col p-4 gap-2 mt-4">
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              className="btn-transition h-9"
              onClick={handleEditClick}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="btn-transition h-9"
              onClick={handleQRClick}
            >
              <QrCode className="h-4 w-4 mr-2" />
              Show QR
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button 
              variant="secondary" 
              size="sm" 
              className="btn-transition h-9 bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              <BarChart className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="btn-transition h-9 bg-red-100 text-red-700 hover:bg-red-200"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
          
          <Button 
            variant="default" 
            size="sm" 
            className="w-full mt-1 btn-transition h-9"
            onClick={handleLaunch}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Launch
          </Button>
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <EditChatbotDialog
        chatbot={chatbot}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onUpdate={handleUpdateChatbot}
      />

      {/* QR Code Dialog */}
      <QRCodeDialog
        url={chatbot.uniqueUrl}
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
    </>
  );
};

export default ChatbotCard;
