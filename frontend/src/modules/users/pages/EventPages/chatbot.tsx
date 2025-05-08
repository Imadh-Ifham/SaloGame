import React, { useState, useRef, useEffect } from "react";
import axiosInstance from "@/axios.config";
import { FaPaperPlane, FaRobot } from "react-icons/fa";
import { motion } from "framer-motion";

interface ChatMessage {
  user: string;
  bot: string;
  timestamp: Date;
}

interface EventChatbotProps {
  eventId?: string; // Optional - to contextualize the chat for a specific event
}

const EventChatbot: React.FC<EventChatbotProps> = ({ eventId }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  
  // Session ID could be user ID or a random ID if user is not logged in
  const sessionId = localStorage.getItem("userId") || "guest-" + Math.random().toString(36).substring(2, 9);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = { 
      user: message, 
      bot: "", 
      timestamp: new Date() 
    };
    
    setChat([...chat, userMessage]);
    setIsLoading(true);
    setMessage("");

    try {
      const response = await axiosInstance.post("/chatbot/ask", { 
        message, 
        sessionId,
        eventId // Pass event context if available
      });
      
      setChat(prevChat => {
        const newChat = [...prevChat];
        const lastIndex = newChat.length - 1;
        newChat[lastIndex] = { 
          ...newChat[lastIndex], 
          bot: response.data.reply 
        };
        return newChat;
      });
    } catch (error) {
      console.error("Chatbot error:", error);
      setChat(prevChat => {
        const newChat = [...prevChat];
        const lastIndex = newChat.length - 1;
        newChat[lastIndex] = { 
          ...newChat[lastIndex], 
          bot: "Sorry, I'm having trouble connecting to my knowledge base. Please try again later." 
        };
        return newChat;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
        {/* Chat toggle button */}
        <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg z-50"
        >
        <FaRobot className="text-white text-xl" />
        </motion.button>

        {/* Chat window */}
        {isOpen && (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-24 left-6 w-80 sm:w-96 bg-gray-800 rounded-lg shadow-xl overflow-hidden z-50 border border-gray-700"
        >
          {/* Header */}
          <div className="bg-primary text-white p-3 flex justify-between items-center">
            <div className="flex items-center">
              <FaRobot className="mr-2" />
              <h3 className="font-medium">Event Assistant</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>

          {/* Chat messages */}
          <div 
            ref={chatBoxRef}
            className="h-80 overflow-y-auto p-4 bg-gray-900 space-y-4"
          >
            {chat.length === 0 ? (
              <div className="text-center text-gray-400 my-8">
                <FaRobot className="mx-auto text-4xl mb-2 text-primary" />
                <p>Ask me anything about events!</p>
                <p className="text-xs mt-2">I can help with registrations, schedules, and rules.</p>
              </div>
            ) : (
              chat.map((msg, index) => (
                <div key={index} className="space-y-2">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-primary text-white p-2 rounded-lg rounded-tr-none max-w-[80%]">
                      <p>{msg.user}</p>
                    </div>
                  </div>
                  
                  {/* Bot message */}
                  {(msg.bot || isLoading && index === chat.length - 1) && (
                    <div className="flex justify-start">
                      <div className="bg-gray-700 text-white p-2 rounded-lg rounded-tl-none max-w-[80%]">
                        {isLoading && index === chat.length - 1 ? (
                          <div className="flex items-center space-x-1">
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        ) : (
                          <p>{msg.bot}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Input area */}
          <div className="p-3 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 p-2 bg-gray-700 text-white rounded-l-lg focus:outline-none"
              />
              <button 
                onClick={sendMessage}
                disabled={!message.trim() || isLoading}
                className={`p-2 ${!message.trim() || isLoading ? 'bg-gray-600' : 'bg-primary'} text-white rounded-r-lg`}
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default EventChatbot;