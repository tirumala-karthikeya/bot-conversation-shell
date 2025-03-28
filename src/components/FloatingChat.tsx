
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Mic, MicOff, Send } from "lucide-react";
import { chatbotApi } from "@/services/api";

type MessageType = {
  type: "user" | "bot" | "error";
  content: string;
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
  avatarColor: string;
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
  headerColor = "#3b82f6",
  welcomeMessage = "Hello! How can I help you today?",
  backgroundGradient,
  chatLogoImage,
  iconAvatarImage,
  avatarColor,
  apiKey,
  analyticsUrl
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([
    { type: "bot", content: welcomeMessage }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  
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

    // Store the query and clear input field
    const userQuery = query;
    setQuery("");
    
    // Add user message to chat
    setMessages((prev) => [...prev, { type: "user", content: userQuery }]);
    setIsLoading(true);

    try {
      // Use API service to send message
      const response = await chatbotApi.sendChatMessage(
        chatbotId,
        userQuery,
        conversationId
      );
      
      // Update conversation ID for future messages
      setConversationId(response.conversation_id);
      
      // Add bot response to chat
      setMessages(prev => [...prev, { type: "bot", content: response.answer }]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { type: "error", content: error.message || "Failed to connect to the chat service." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to analytics dashboard if available
  const handleAnalyticsClick = () => {
    if (analyticsUrl) {
      window.open(analyticsUrl, '_blank');
    }
  };

  // Format message content with improved HTML
  const formatMessageContent = (content: string) => {
    return content
      // Remove asterisks from text (remove bold formatting)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Format bullet points with text (• Text: More text)
      .replace(/•\s+(.*?):\s+(.*?)($|\n)/g, 
        '<li><span class="font-medium">$1:</span> $2</li>$3')
      // Format regular bullet points (• Text)
      .replace(/•\s+(.*?)($|\n)/g, '<li>$1</li>$2')
      // Convert bullet lists to proper ul
      .replace(/<li>(.*?)(<\/li>\n*)+/g, '<ul class="list-disc pl-5 my-2">$&</ul>')
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
            onClick={handleAnalyticsClick}
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
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`message-bubble p-2 sm:p-3 ${
                    msg.type === "user"
                      ? "user-message"
                      : msg.type === "error"
                      ? "error-message"
                      : "bot-message"
                  } max-w-[85%] sm:max-w-[80%] animate-message-appear`}
                  style={{
                    background: msg.type === "user" && backgroundGradient
                      ? `linear-gradient(135deg, ${backgroundGradient.from}, ${backgroundGradient.to})`
                      : undefined
                  }}
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
          
          <div className="p-2 sm:p-4 border-t animate-slide-up">
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
                onClick={sendMessage}
                disabled={isLoading}
                style={{ backgroundColor: headerColor }}
                className="rounded-lg text-white transition-colors duration-200"
                size="icon"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-4 w-4"
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
