
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getChatbotById } from "@/services/chatbotService";
import { ChevronLeft, Settings } from "lucide-react";

type MessageType = {
  type: "user" | "bot" | "error";
  content: string;
};

// Speech recognition setup
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const ChatbotDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const chatbot = getChatbotById(id || "");

  const [query, setQuery] = useState<string>("");
  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setQuery(prev => prev + transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };
      } catch (error) {
        console.error("Error initializing speech recognition:", error);
      }
    }

    // Set initial welcome message
    if (chatbot) {
      setMessages([
        { 
          type: "bot", 
          content: `Welcome to the ${chatbot.name} chatbot! How can I assist you today?` 
        }
      ]);
    }

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [chatbot]);

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

  // Toggle speech recognition
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    }
  };

  const sendMessage = async () => {
    if (!query.trim() || isLoading) return;

    // Add user message
    setMessages((prev) => [...prev, { type: "user", content: query }]);
    
    // Save the query and clear the input
    const userQuery = query;
    setQuery("");
    
    setIsLoading(true);

    try {
      // Simulate API call with timeout
      setTimeout(() => {
        // Add bot response based on user query
        let botResponse = "I'm sorry, I don't have an answer for that right now.";
        
        if (userQuery.toLowerCase().includes("hello") || userQuery.toLowerCase().includes("hi")) {
          botResponse = `Hello! How can I help you with ${chatbot.name} today?`;
        } else if (userQuery.toLowerCase().includes("help")) {
          botResponse = `I can assist you with information about ${chatbot.name}. What specific information do you need?`;
        } else if (userQuery.toLowerCase().includes("features") || userQuery.toLowerCase().includes("what can you do")) {
          botResponse = `As a ${chatbot.name} assistant, I can help with:\n• Answering common questions\n• Providing information about our services\n• Assisting with troubleshooting\n• Connecting you with human support if needed`;
        } else {
          botResponse = `Thank you for your message about "${userQuery}". I'm still learning about ${chatbot.name}. Would you like me to forward this to our support team?`;
        }
        
        setMessages(prev => [...prev, { type: "bot", content: botResponse }]);
        setIsLoading(false);
      }, 1000);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { type: "error", content: error.message || "Failed to connect to the chat service." }
      ]);
      setIsLoading(false);
    }
  };

  // Format message content with improved HTML
  const formatMessageContent = (content: string) => {
    // First fix any incomplete/broken asterisk pairs
    content = content.replace(/-\s*([^:]+):\*\*\s*([^*]+)($|\n)/g, '- $1: $2$3');
    
    return content
      // Format profile information blocks
      .replace(/(- [^:]+: [^\n]+\n)+/g, (match) => {
        // Convert each profile line to a styled div
        const formattedLines = match.split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => {
            const parts = line.match(/- ([^:]+): (.*)/);
            if (parts) {
              const [_, field, value] = parts;
              return `<div class="profile-field"><span class="profile-label">${field}:</span> <span class="profile-value">${value}</span></div>`;
            }
            return line;
          })
          .join('');
        
        return `<div class="profile-card">${formattedLines}</div>`;
      })
      // Remove asterisks from text (remove bold formatting)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Format headers (### Title)
      .replace(/###\s+(.*?)($|\n)/g, '<h3 class="text-lg font-semibold mt-3 mb-2">$1</h3>$2')
      // Fix improperly formatted numbered lists (where number is missing)
      .replace(/^\.\s+(.*?)($|\n)/gm, '0. $1$2')
      // Format numbered list items ONLY at the start of a line
      .replace(/^(\d+)\.?\s+(.*?)($|\n)/gm, '<li class="numbered-item">$1. $2</li>$3')
      // Format bullet points with text (• Text: More text)
      .replace(/•\s+(.*?):\s+(.*?)($|\n)/g, 
        '<li><span class="font-medium">$1:</span> $2</li>$3')
      // Format regular bullet points (• Text)
      .replace(/•\s+(.*?)($|\n)/g, '<li>$1</li>$2')
      // Convert bullet lists to proper ul
      .replace(/<li>(.*?)(<\/li>\n*)+/g, '<ul class="list-disc pl-5 my-2">$&</ul>')
      // Convert numbered lists to proper ol
      .replace(/<li class="numbered-item">(.*?)(<\/li>\n*)+/g, '<ol class="list-decimal pl-5 my-2">$&</ol>')
      // Handle images
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="my-3 rounded w-full">')
      // Convert regular line breaks
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
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
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: chatbot.avatarColor }}
              >
                {chatbot.avatarInitial ? (
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
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-white/20"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl animate-fade-in-up">
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Bot Information</h2>
          <div className="text-sm text-muted-foreground">
            <p><span className="font-medium">ID:</span> {chatbot.id}</p>
            <p><span className="font-medium">URL:</span> {chatbot.uniqueUrl}</p>
            <p><span className="font-medium">Created:</span> {chatbot.createdAt.toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden min-h-[400px] flex flex-col mb-8 chat-container">
          <div className="bg-blue-500 text-white p-3 sm:p-4 flex justify-between items-center">
            <h2 className="text-base sm:text-lg font-semibold">Chat Preview</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`message-bubble p-2 sm:p-3 ${
                    msg.type === "user"
                      ? "user-message"
                      : msg.type === "error"
                      ? "error-message"
                      : "bot-message"
                  } max-w-[85%] sm:max-w-[80%]`}
                >
                  <div 
                    className="message-content text-sm sm:text-base"
                    dangerouslySetInnerHTML={{
                      __html: formatMessageContent(msg.content)
                    }}
                  />
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-2 sm:p-4 border-t">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 chat-input"
                placeholder="Type your message..."
                disabled={isLoading}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && sendMessage()}
              />
              
              <button
                onClick={toggleListening}
                disabled={isLoading}
                className={`px-3 py-2 rounded-lg ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                } transition-colors duration-200`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </button>
              
              <button
                onClick={sendMessage}
                disabled={isLoading}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-white chat-button ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } transition-colors duration-200`}
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatbotDetail;
