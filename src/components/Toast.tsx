import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error';
    onClose: () => void;
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-4 right-4 flex items-center p-4 rounded-lg shadow-lg space-x-2 z-50 ${
            type === 'success' ? 'bg-green-100' : 'bg-red-100'
        }`}>
            <span className={type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message}
            </span>
            <button
                onClick={onClose}
                className={`p-1 rounded-full hover:bg-opacity-20 ${
                    type === 'success' ? 'hover:bg-green-200' : 'hover:bg-red-200'
                }`}
            >
                <X size={16} />
            </button>
        </div>
    );
} 