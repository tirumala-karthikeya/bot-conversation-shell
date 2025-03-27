
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Mic, MicOff, Send } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type MessageType = {
  type: "user" | "bot" | "error";
  content: string;
};

interface FloatingChatProps {
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
  chatbotName, 
  headerColor = "#3b82f6",
  welcomeMessage = "Hello! How can I help you today?",
  backgroundGradient,
  chatLogoImage,
  iconAvatarImage,
  avatarColor,
  apiKey
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

    setMessages((prev) => [...prev, { type: "user", content: query }]);
    setIsLoading(true);
    
    // Store the query and clear input field
    const userQuery = query;
    setQuery("");

    try {
      if (apiKey) {
        // If we have an API key, use it to call the real API
        const payload = {
          inputs: {},
          query: userQuery,
          response_mode: "streaming",
          conversation_id: conversationId,
          user: "user-123",
          files: []
        };

        const response = await fetch(`https://api.next-agi.com/v1/chat-messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            Accept: "text/event-stream"
          },
          body: JSON.stringify(payload),
          duplex: "half"
        } as RequestInit);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        // Add a bot message that we'll update
        setMessages((prev) => [...prev, { type: "bot", content: "" }]);

        if (reader) {
          let fullAnswer = "";
          
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });
            text.split("\n").forEach((line) => {
              if (line.startsWith("data: ")) {
                try {
                  const eventData = JSON.parse(line.slice(6));
                  if (eventData.conversation_id) {
                    setConversationId(eventData.conversation_id);
                  }
                  if (eventData.answer) {
                    // Accumulate the answer chunks
                    fullAnswer += eventData.answer;
                    // Update the last message instead of adding a new one
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      newMessages[newMessages.length - 1] = { 
                        type: "bot", 
                        content: fullAnswer 
                      };
                      return newMessages;
                    });
                  }
                } catch (error) {
                  console.error("Error parsing SSE event:", error);
                }
              }
            });
          }
        }
      } else {
        // Simulate API call with timeout
        setTimeout(() => {
          // Add bot response based on user query
          let botResponse = "I'm sorry, I don't have an answer for that right now.";
          
          if (userQuery.toLowerCase().includes("hello") || userQuery.toLowerCase().includes("hi")) {
            botResponse = `Hello! How can I help you with ${chatbotName} today?`;
          } else if (userQuery.toLowerCase().includes("help")) {
            botResponse = `I can assist you with information about ${chatbotName}. What specific information do you need?`;
          } else if (userQuery.toLowerCase().includes("features") || userQuery.toLowerCase().includes("what can you do")) {
            botResponse = `As a ${chatbotName} assistant, I can help with:\n• Answering common questions\n• Providing information about our services\n• Assisting with troubleshooting\n• Connecting you with human support if needed`;
          } else {
            botResponse = `Thank you for your message about "${userQuery}". I'm still learning about ${chatbotName}. Would you like me to forward this to our support team?`;
          }
          
          setMessages(prev => [...prev, { type: "bot", content: botResponse }]);
        }, 1000);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { type: "error", content: error.message || "Failed to connect to the chat service." }
      ]);
    } finally {
      setIsLoading(false);
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
          className="text-white rounded-full p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center chat-button"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      ) : (
        <div 
          ref={chatContainerRef}
          className="bg-white rounded-lg shadow-2xl w-[90vw] sm:w-[350px] md:w-[400px] lg:w-[450px] h-[80vh] sm:h-[600px] md:h-[650px] lg:h-[700px] max-h-[90vh] flex flex-col chat-container"
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
              className="text-white hover:text-gray-200"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
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
