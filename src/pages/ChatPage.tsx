import { ChatBox } from '../components/ChatBox';
import { Toaster } from 'react-hot-toast';

export const ChatPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Servicio de Atención al Cliente
        </h1>
        <ChatBox />
      </div>
      <Toaster position="top-right" />
    </div>
  );
}; 