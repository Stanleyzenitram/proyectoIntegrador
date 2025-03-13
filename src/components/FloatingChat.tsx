import { useState, useRef, useEffect } from 'react';
import { generateResponse } from '../services/chatService';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
}

interface FloatingChatProps {
  onClose: () => void;
}

const getStorageKey = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return `chatHistory_${session?.user?.id || 'guest'}`;
};

const loadChatHistory = async (): Promise<Message[]> => {
  const storageKey = await getStorageKey();
  const savedHistory = localStorage.getItem(storageKey);
  if (savedHistory) {
    const parsedHistory = JSON.parse(savedHistory);
    return parsedHistory.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
  }
  return [];
};

const saveChatHistory = async (messages: Message[]) => {
  const storageKey = await getStorageKey();
  localStorage.setItem(storageKey, JSON.stringify(messages));
};

export const FloatingChat = ({ onClose }: FloatingChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Cargar historial inicial
  useEffect(() => {
    loadChatHistory().then(setMessages);
  }, []);

  // Limpiar el chat cuando cambie la sesión
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
        clearHistory();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const clearHistory = async () => {
    const storageKey = await getStorageKey();
    setMessages([]);
    localStorage.removeItem(storageKey);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await generateResponse(inputMessage);
      const aiMessage: Message = {
        content: response.response,
        isUser: false,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Manejar acciones especiales
      if (response.action) {
        switch (response.action.type) {
          case 'navigate':
            const { path, filter } = response.action.payload;
            if (filter === 'offers') {
              // Navegar a la página principal con el filtro de ofertas
              navigate(path, { state: { showOffers: true } });
              onClose(); // Cerrar el chat después de la navegación
            } else {
              navigate(path);
            }
            break;
          default:
            break;
        }
      }
    } catch (error) {
      toast.error('Error al procesar tu mensaje. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      <div className="bg-amber-600 text-white p-3 rounded-t-lg flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Asistente Virtual</h2>
          <p className="text-xs opacity-75">¿En qué puedo ayudarte?</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={clearHistory}
            className="text-white hover:text-gray-200 text-sm px-2 py-1 rounded"
            title="Limpiar historial"
          >
            Limpiar
          </button>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className="space-y-2">
            <div
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser
                    ? 'bg-amber-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-75 mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
            {!message.isUser && message.suggestions && (
              <div className="flex flex-wrap gap-2 ml-2">
                {message.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs bg-gray-200 hover:bg-amber-100 text-gray-700 px-3 py-1 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-amber-600 text-white p-2 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}; 