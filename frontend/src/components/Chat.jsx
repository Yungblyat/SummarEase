import React, { useState, Fragment, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { ChevronDown, X, Send, MessageCircle } from 'lucide-react';
import api from "../api";
import { FILE_ID } from '../constants';

export default function ChatInterface() {
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi 👋 How can I help you?", sender: 'assistant' },
    { id: 2, text: "Looking for my package", sender: 'user' },
    { id: 3, text: "Let's take care of your order 📦 Please choose the right topic:", sender: 'assistant' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [fileId, setFileId] = useState(null);

  useEffect(() => {
    const storedFileId = localStorage.getItem(FILE_ID);
    if (storedFileId) {
      setFileId(storedFileId);
    }
  }, []);

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
    if (messageText.trim()) {
      setMessages([...messages, { id: messages.length + 1, text: messageText, sender: 'user' }]);
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
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/placeholder.svg?height=40&width=40" alt="Profile" className="w-10 h-10 rounded-full" />
              <div>
                <h2 className="text-white font-semibold">Chat with Jessica Smith</h2>
                <p className="text-blue-100 text-sm">We are online!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="text-white hover:bg-blue-700 rounded-full p-1">
                <ChevronDown className="h-5 w-5" />
              </button>
              <button
                onClick={toggleChat}
                className="text-white hover:bg-blue-700 rounded-full p-1"
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
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply.id}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  onClick={() => handleSendMessage(reply.text)} // Call handleSendMessage with reply text
                >
                  {reply.text}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4 border-t flex items-center space-x-2">
            <input
              type="text"
              placeholder="Enter your message..."
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Transition>
      <div className="mt-2">
        <button
          onClick={toggleChat}
          className="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg transition-colors"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
