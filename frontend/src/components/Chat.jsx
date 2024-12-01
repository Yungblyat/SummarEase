import React, { useState, Fragment, useEffect, useRef } from 'react';
import { Transition } from '@headlessui/react';
import { ChevronDown, X, Send, MessageCircle } from 'lucide-react';
import api from "../api";
import { FILE_ID } from '../constants';
import "../styles/Chat.css";
import bot_icon from "../assets/bot.png";

export default function ChatInterface() {
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi How can I help you? Feel free to ask anything", sender: 'assistant' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [fileId, setFileId] = useState(null);

  const messagesEndRef = useRef(null); // Reference to scroll to

  useEffect(() => {
    const storedFileId = localStorage.getItem(FILE_ID);
    if (storedFileId) {
      setFileId(storedFileId);
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom every time a new message is added
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]); // Re-run this effect when messages change

  async function sendReceiveMessage(message) {
    try {
      const response = await api.post("/chatbot/chat/", { message, fileId });
      return response.data;
    } catch (error) {
      console.error("Error sending/receiving message:", error);
      throw error;
    }
  }

  const quickReplies = [
    { id: 1, text: "List key Items" },
    { id: 2, text: "Summarize Further" },
  ];

  const toggleChat = () => setIsVisible(!isVisible);

  const handleSendMessage = async (messageText = inputMessage) => {
    // console.log("handleSendMessage called with:", messageText); // Debugging log
    if (messageText.trim()) {
      setMessages(prevMessages => [...prevMessages, { id: prevMessages.length + 1, text: messageText, sender: 'user' }]);
      setInputMessage('');
      try {
        const response = await sendReceiveMessage(messageText);
        setMessages(prevMessages => [...prevMessages, { id: prevMessages.length + 1, text: response, sender: 'assistant' }]);
      } catch (error) {
        setMessages(prevMessages => [...prevMessages, { id: prevMessages.length + 1, text: "Sorry, there was an error processing your message.", sender: 'assistant' }]);
      }
    }
  };
  

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end">
      <Transition
        show={isVisible}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div className="bot">
          <div className="bot-header">
            <div className="flex items-center space-x-3">
              <img src={bot_icon} alt="Profile" className="w-10 h-10" />
              <div>
                <h2 className="text-white font-semibold">Chat with SumAssist</h2>
                <p className="text-blue-100 text-sm">Powered by Grok</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleChat}
                className="text-white hover:bg-purple-400ß rounded-full p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-purple-400 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            
            {/* This will scroll into view */}
            <div ref={messagesEndRef} />
            
            {/* Quick reply buttons */}
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply.id}
                  className="bg-purple-950 text-white px-3 py-1 rounded-full text-sm hover:bg-purple-400 transition-colors"
                  onClick={() => handleSendMessage(reply.text)} 
                >
                  {reply.text}
                </button>
              ))}
            </div>
          </div>

          {/* Input box for new message */}
          <div className="p-4 border-t flex items-center space-x-2">
            <input
              type="text"
              placeholder="Enter your message..."
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-950 text-gray-900"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
           <button
            onClick={() => handleSendMessage()}
            className="bg-purple-950 text-white rounded-lg p-2 hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>

          </div>
        </div>
      </Transition>
      
      {/* Button to toggle the chat window */}
      <div className="mt-2">
        <button
          onClick={toggleChat}
          className="bg-purple-950 text-white rounded-lg p-5 hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-lg transition-colors"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}