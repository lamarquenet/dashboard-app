'use client';
import React from 'react';
import ChatComponent from '../../components/ChatComponent'; // Import the ChatComponent

const ChatPage = () => {
  return (
    // Use Tailwind classes for layout and styling
    <main className="flex flex-col h-full p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Chat LLM
      </h1>
      {/* Render the ChatComponent */}
      <div className="flex-grow"> {/* Allow ChatComponent to take available space */}
        <ChatComponent />
      </div>
    </main>
  );
};

export default ChatPage;