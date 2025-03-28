import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Mic, MicOff, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { chatbotApi } from "@/services/api";

type MessageType = {
  type: 'user' | 'bot' | 'error';
  content: string;
  timestamp: Date;
};

type ChatResponse = {
  answer: string;
  conversation_id?: string;
};

interface FloatingChatProps {
  chatbotId: string;
  chatbotName: string;
  headerColor?: string;
  welcomeMessage?: string;
  backgroundGradient?: {
    from: string;
    to: string;
  };
  chatLogoImage?: string;
  iconAvatarImage?: string;
  avatarColor?: string;
  apiKey?: string;
  analyticsUrl?: string;
}

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

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const FloatingChat: React.FC<FloatingChatProps> = ({ 
  chatbotId,
  chatbotName, 
  headerColor = "#f3f4f6",
  welcomeMessage = "Hello! How can I help you today?",
  backgroundGradient,
  chatLogoImage,
  iconAvatarImage,
  avatarColor = "#3b82f6",
  apiKey,
  analyticsUrl
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([
    { type: 'bot', content: welcomeMessage, timestamp: new Date() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle click outside chat container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

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

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, []);

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

    setIsLoading(true);
    setMessages((prev) => [...prev, { type: "user", content: query, timestamp: new Date() }]);
    
    const currentQuery = query;
    setQuery("");

    try {
      // Add temporary bot message
      setMessages((prev) => [...prev, { type: "bot", content: "", timestamp: new Date() }]);
      
      const response = await chatbotApi.sendChatMessage(currentQuery, conversationId) as ChatResponse;
      
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }
      
      // Update the last message with the response
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { 
          type: "bot", 
          content: response.answer,
          timestamp: new Date()
        };
        return newMessages;
      });
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const newMessages = prev.slice(0, -1);
        return [
          ...newMessages,
          { 
            type: "error", 
            content: error.message || "Failed to connect to the chat service.",
            timestamp: new Date()
          }
        ];
      });
    } finally {
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

  // Render avatar for the chat header
  const renderAvatar = () => {
    return (
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: avatarColor }}
        >
          {iconAvatarImage ? (
            <img 
              src={iconAvatarImage} 
              alt={chatbotName} 
              className="w-full h-full object-cover"
            />
          ) : chatLogoImage ? (
            <img 
              src={chatLogoImage} 
              alt={chatbotName} 
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <MessageCircle className="h-4 w-4 text-white" />
          )}
        </div>
        <span className="font-semibold">{chatbotName}</span>
        
        {analyticsUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-xs hover:bg-white/10"
            onClick={() => window.open(analyticsUrl, '_blank')}
          >
            Analytics
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          style={{ 
            backgroundColor: headerColor,
            borderColor: 'transparent'
          }}
          className="text-white rounded-full p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center chat-button animate-bounce-subtle"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      ) : (
        <div 
          ref={chatContainerRef}
          className="bg-white rounded-lg shadow-2xl w-[90vw] sm:w-[350px] md:w-[400px] lg:w-[450px] h-[80vh] sm:h-[600px] md:h-[650px] lg:h-[700px] max-h-[90vh] flex flex-col chat-container animate-scale-in"
        >
          <div 
            className="text-white p-3 sm:p-4 rounded-t-lg flex justify-between items-center"
            style={{ 
              background: backgroundGradient
                ? `linear-gradient(to right, ${backgroundGradient.from}, ${backgroundGradient.to})`
                : headerColor
            }}
          >
            {renderAvatar()}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-2 sm:p-3 rounded-lg max-w-[85%] sm:max-w-[80%] ${
                    msg.type === "user"
                      ? "bg-blue-500 text-white"
                      : msg.type === "error"
                      ? "bg-red-100 text-red-800 border border-red-300"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  <div 
                    className="text-sm sm:text-base"
                    dangerouslySetInnerHTML={{
                      __html: msg.content ? formatMessageContent(msg.content) : ''
                    }}
                  />
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-2 sm:p-4 border-t">
            <div className="flex gap-2 items-center">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
                placeholder="Type your message..."
                disabled={isLoading}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && sendMessage()}
              />
              
              <Button
                onClick={toggleListening}
                disabled={isLoading}
                variant="ghost"
                size="icon"
                className={`rounded-lg ${
                  isListening
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } transition-colors duration-200`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              
              <Button
                onClick={() => sendMessage()}
                disabled={isLoading}
                style={{ backgroundColor: headerColor }}
                className="rounded-lg text-white transition-colors duration-200"
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChat;
