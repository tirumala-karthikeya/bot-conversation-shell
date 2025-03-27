
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-10 w-full">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Chatbot Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button className="flex items-center gap-2 btn-transition" variant="default">
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
