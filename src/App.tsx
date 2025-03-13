import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <AppRouter />
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App; 

// esto sirve para como se va a comportar el nav es el controlador 