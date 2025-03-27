
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-10 w-full animate-fade-in">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md flex items-center justify-center overflow-hidden bg-primary/10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-primary">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              <path d="M9.1 12a2.1 2.1 0 0 0 0 4.2" />
              <path d="M14.9 16.2a2.1 2.1 0 0 0 0-4.2" />
            </svg>
          </div>
          <h1 
            className="text-2xl font-semibold tracking-tight cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate("/")}
          >
            Agents Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            className="flex items-center gap-2 btn-transition animate-pulse-subtle" 
            variant="default"
            onClick={() => navigate("/")}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Create New Bot</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
