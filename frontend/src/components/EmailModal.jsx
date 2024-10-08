'use client';
import { FILE_ID } from '../constants';
import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import axios from 'axios';
import api from "../api"

export const file_id = null;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function EmailModal({ isOpen, setIsOpen, emails, setEmails }) {
  const [inputValue, setInputValue] = useState('');
  const handleInputChange = (e) => {
    const input = e.target.value;
    
    // Check if input contains commas or spaces to split emails
    if (/[,\s]/.test(input)) {
      const newEmails = input
        .split(/[,\s]+/)
        .filter((email) => emailRegex.test(email.trim()) && !emails.includes(email.trim()));

      if (newEmails.length > 0) {
        setEmails([...emails, ...newEmails]);
        setInputValue('');  // Clear the input field after adding emails
      } else {
        setInputValue(input);  // Otherwise, keep typing
      }
    } else {
      setInputValue(input);  // Handle single email typing case
    }
  };

  const handleRemoveEmail = (index) => {
    const newEmails = emails.filter((_, i) => i !== index);
    setEmails(newEmails);
  };

  const handleSendEmails = async () => {
    try {
      const file_id = localStorage.getItem(FILE_ID)
      const response = await api.post('/email/send/', { emails, file_id });
      setIsOpen(false);
      setEmails([]);
    } catch (error) {
      console.error('Failed to send emails:', error);
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Enter Email Addresses
                </Dialog.Title>
                <div className="mb-4">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email addresses (comma or space separated)"
                  />
                </div>
                <div className="bg-gray-100 p-3 rounded-md max-h-60 overflow-y-auto mb-4">
                  <div className="flex flex-wrap gap-2">
                    {emails.map((email, index) => (
                      <div
                        key={index}
                        className="bg-white px-2 py-1 rounded-md border border-gray-300 flex items-center group"
                      >
                        <span className="mr-1 text-sm">{email}</span>
                        <button
                          onClick={() => handleRemoveEmail(index)}
                          className="text-gray-400 hover:text-red-500 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Remove ${email}`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {emails.length === 0 && (
                    <p className="text-gray-500 text-sm">No emails added yet.</p>
                  )}
                </div>
                <button
                  onClick={handleSendEmails}
                  className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Send to Email
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
