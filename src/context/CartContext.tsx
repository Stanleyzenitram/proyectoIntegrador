import { createContext, useContext, useState, ReactNode } from 'react';
import { Producto, CartItem } from '../types';
import { supabase } from '../services/supabase';

interface CartContextType {
    items: CartItem[];
    addItem: (product: Producto) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    total: number;
    totalWithDiscount: number;
    clearCart: () => void;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Calcular la cantidad total de artículos
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const addItem = async (product: Producto) => {
        // Verificar stock actual
        const { data: currentProduct } = await supabase
            .from('productos')
            .select('stock_actual')
            .eq('id_producto', product.id_producto)
            .single();

        if (!currentProduct) {
            alert('Error al verificar stock');
            return;
        }

        const currentItem = items.find(item => item.id_producto === product.id_producto);
        const currentQuantity = currentItem?.quantity || 0;

        if (currentQuantity >= currentProduct.stock_actual) {
            alert('Has alcanzado el límite de stock disponible');
            return;
        }

        if (currentQuantity + 1 > currentProduct.stock_actual) {
            alert('No hay suficiente stock disponible');
            return;
        }

        setItems(currentItems => {
            const existingItem = currentItems.find(item => item.id_producto === product.id_producto);
            
            if (existingItem) {
                return currentItems.map(item =>
                    item.id_producto === product.id_producto
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            
            return [...currentItems, { ...product, quantity: 1 }];
        });
    };

    const removeItem = (productId: string) => {
        setItems(currentItems => currentItems.filter(item => item.id_producto !== productId));
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        if (quantity < 1) {
            removeItem(productId);
            return;
        }

        // Verificar stock actual
        const { data: currentProduct } = await supabase
            .from('productos')
            .select('stock_actual')
            .eq('id_producto', productId)
            .single();

        if (!currentProduct) {
            alert('Error al verificar stock');
            return;
        }

        if (quantity > currentProduct.stock_actual) {
            alert('No hay suficiente stock disponible');
            // Establecer la cantidad al máximo stock disponible
            setItems(currentItems =>
                currentItems.map(item =>
                    item.id_producto === productId
                        ? { ...item, quantity: currentProduct.stock_actual }
                        : item
                )
            );
            return;
        }

        setItems(currentItems =>
            currentItems.map(item =>
                item.id_producto === productId
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const total = items.reduce((sum, item) => sum + item.precio * item.quantity, 0);
    
    const totalWithDiscount = items.reduce((sum, item) => {
        const itemTotal = item.precio * item.quantity;
        const discount = item.descuento ? (itemTotal * item.descuento) / 100 : 0;
        return sum + (itemTotal - discount);
    }, 0);

    const clearCart = () => {
        setItems([]);
    };

    const value = {
        items,
        addItem,
        removeItem,
        updateQuantity,
        total,
        totalWithDiscount,
        clearCart,
        itemCount
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 