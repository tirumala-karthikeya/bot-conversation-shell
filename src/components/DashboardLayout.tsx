import React from "react";
import Header from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onBotCreated?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children,
  onBotCreated 
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Header onBotCreated={onBotCreated} />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 animate-fade-in">
        {children}
      </main>
      <footer className="py-4 px-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Chatbot Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};
