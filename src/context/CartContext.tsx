import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Producto, CartItem } from '../types';
import { supabase } from '../services/supabase';

interface CartContextType {
    items: CartItem[];
    addItem: (product: Producto, quantity?: number, options?: { 
        metrosCuadrados?: number;
        cajasNecesarias?: number;
        metrosReales?: number;
    }) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number, options?: {
        metrosCuadrados?: number;
        cajasNecesarias?: number;
        metrosReales?: number;
    }) => void;
    total: number;
    tax: number;
    totalAmount: number;
    totalWithDiscount: number;
    clearCart: () => void;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        // Recuperar carrito desde localStorage al cargar la app
        const storedCart = localStorage.getItem('cart');
        return storedCart ? JSON.parse(storedCart) : [];
    });

    // Efecto para guardar en localStorage cada vez que los ítems cambien
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const addItem = async (
        product: Producto, 
        quantity: number = 1, 
        options?: {
            metrosCuadrados?: number;
            cajasNecesarias?: number;
            metrosReales?: number;
        }
    ) => {
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

        if (currentQuantity + quantity > currentProduct.stock_actual) {
            alert('No hay suficiente stock disponible');
            return;
        }

        setItems(currentItems => {
            const existingItem = currentItems.find(item => item.id_producto === product.id_producto);
            if (existingItem) {
                return currentItems.map(item =>
                    item.id_producto === product.id_producto
                        ? {
                            ...item,
                            quantity: item.quantity + quantity,
                            ...options
                        }
                        : item
                );
            }
            return [...currentItems, {
                ...product,
                quantity,
                unidadMedida: product.metros_por_caja ? 'metro' : 'unidad',
                ...options
            }];
        });
    };

    const removeItem = (productId: string) => {
        setItems(currentItems => currentItems.filter(item => item.id_producto !== productId));
    };

    const updateQuantity = async (
        productId: string, 
        quantity: number,
        options?: {
            metrosCuadrados?: number;
            cajasNecesarias?: number;
            metrosReales?: number;
        }
    ) => {
        if (quantity < 1) {
            removeItem(productId);
            return;
        }

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
            return;
        }

        setItems(currentItems =>
            currentItems.map(item =>
                item.id_producto === productId
                    ? { ...item, quantity, ...options }
                    : item
            )
        );
    };

    const total = items.reduce((sum, item) => {
        if (item.unidadMedida === 'metro' && item.metrosReales) {
            return sum + (item.precio * item.metrosReales);
        }
        return sum + (item.precio * item.quantity);
    }, 0);

    const totalWithDiscount = items.reduce((sum, item) => {
        let itemTotal;
        if (item.unidadMedida === 'metro' && item.metrosReales) {
            itemTotal = item.precio * item.metrosReales;
        } else {
            itemTotal = item.precio * item.quantity;
        }
        const discount = item.descuento ? (itemTotal * item.descuento) / 100 : 0;
        return sum + (itemTotal - discount);
    }, 0);
    
    const tax = totalWithDiscount * 0.18;
    const totalAmount = totalWithDiscount + tax;

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem('cart'); // Limpiar localStorage
    };

    const value = {
        items,
        addItem,
        removeItem,
        updateQuantity,
        total,
        tax,
        totalAmount,
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