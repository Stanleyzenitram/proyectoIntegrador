import { useState } from 'react';
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/solid';
import { FloatingChat } from './FloatingChat';

export const FloatingChatIcon = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 bg-amber-600 text-white p-3 rounded-full shadow-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 z-50 transition-all duration-300 ease-in-out transform hover:scale-110"
      >
        <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-[500px] shadow-2xl rounded-lg overflow-hidden z-50">
          <FloatingChat onClose={toggleChat} />
        </div>
      )}
    </>
  );
}; 