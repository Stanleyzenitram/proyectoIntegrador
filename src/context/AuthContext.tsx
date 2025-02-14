import { createContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../services/supabase";
import { Session, User } from "@supabase/supabase-js"; 
import { useNavigate } from "react-router-dom";

// Definir el tipo para el contexto de autenticación
interface AuthContextProps {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

// Crear el contexto
export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Proveedor de autenticación
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Función para verificar la sesión activa
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            setUser(data.session?.user ?? null);
            setLoading(false); 
        };

        checkSession();

        // Escuchar cambios en la autenticación
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session: Session | null) => {
                setUser(session?.user ?? null);
                setLoading(false); // Marcar como cargado cuando haya un cambio
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // Función para iniciar sesión
    const login = async (email: string, password: string) => {
        const { error, data } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        setUser(data.user);
    };

    // Función para cerrar sesión
    const logout = async () => {
        try {
            await supabase.auth.signOut(); 
            setUser(null); 
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };


    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
