import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateChatbotDialog from "./CreateChatbotDialog";

interface HeaderProps {
  onBotCreated?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBotCreated }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateClick = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    if (onBotCreated) {
      onBotCreated();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <h1 className="text-lg font-semibold">Agents Dashboard</h1>
        </div>

        <Button 
          onClick={handleCreateClick}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create New Bot
        </Button>

        {/* Create Bot Dialog */}
        <CreateChatbotDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </header>
  );
};

export default Header;
