import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router';
import OnboardingWrapper from './components/OnboardingWrapper';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <OnboardingWrapper>
                        <AppRouter />
                    </OnboardingWrapper>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;

// esto sirve para como se va a comportar el nav es el controlador 