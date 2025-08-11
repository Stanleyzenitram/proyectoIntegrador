import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Producto, CartItem } from '../types';
import { supabase } from '../services/supabase';

interface DeliveryAddress {
    calle: string;
    ciudad: string;
    provincia: string;
    codigo_postal: string;
    referencia?: string;
    pais?: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: Producto, quantity?: number, options?: { 
        metrosCuadrados?: number;
        cajasNecesarias?: number;
        metrosReales?: number;
    }) => Promise<void>;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number, options?: {
        metrosCuadrados?: number;
        cajasNecesarias?: number;
        metrosReales?: number;
    }) => Promise<void>;
    subtotal: number;
    total: number;
    tax: number;
    totalAmount: number;
    totalWithDiscount: number;
    clearCart: () => void;
    itemCount: number;
    deliveryAddress: DeliveryAddress | null;
    setDeliveryAddress: (address: DeliveryAddress | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        // Recuperar carrito desde localStorage al cargar la app
        const storedCart = localStorage.getItem('cart');
        return storedCart ? JSON.parse(storedCart) : [];
    });

    const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(() => {
        // Recuperar dirección de entrega desde localStorage al cargar la app
        const storedAddress = localStorage.getItem('deliveryAddress');
        return storedAddress ? JSON.parse(storedAddress) : null;
    });

    // Efecto para guardar en localStorage cada vez que los ítems cambien
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    // Efecto para guardar en localStorage cada vez que la dirección cambie
    useEffect(() => {
        if (deliveryAddress) {
            localStorage.setItem('deliveryAddress', JSON.stringify(deliveryAddress));
        } else {
            localStorage.removeItem('deliveryAddress');
        }
    }, [deliveryAddress]);

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
        // Validar que la cantidad sea un número válido
        if (!quantity || isNaN(quantity) || quantity < 1) {
            console.error('Cantidad inválida:', quantity);
            quantity = 1;
        }

        // Validar que el producto tenga los datos necesarios
        if (!product.id_producto || !product.nombre_producto || !product.precio) {
            console.error('Producto inválido:', product);
            return;
        }

        console.log('Agregando producto al carrito:', { product, quantity, options });

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

        if (currentItem) {
            // Si el item ya existe, actualizar cantidad
            const newQuantity = currentItem.quantity + quantity;
            if (newQuantity <= currentProduct.stock_actual) {
                setItems(currentItems => {
                    const updatedItems = currentItems.map(item => 
                        item.id_producto === product.id_producto 
                            ? { ...item, quantity: newQuantity }
                            : item
                    );
                    console.log('Cantidad actualizada en carrito:', updatedItems);
                    return updatedItems;
                });
            } else {
                alert('Stock insuficiente');
            }
        } else {
            // Si es un nuevo item, agregarlo
            if (quantity <= currentProduct.stock_actual) {
                const newItem: CartItem = {
                    ...product,
                    quantity: quantity,
                    metrosCuadrados: options?.metrosCuadrados || 0,
                    cajasNecesarias: options?.cajasNecesarias || quantity,
                    metrosReales: options?.metrosReales || 0,
                    precioTotal: product.precio * quantity
                };
                
                console.log('Nuevo item agregado:', newItem);
                setItems(currentItems => {
                    const newItems = [...currentItems, newItem];
                    console.log('Carrito actualizado:', newItems);
                    return newItems;
                });
            } else {
                alert('Stock insuficiente');
            }
        }
    };

    const removeItem = (productId: number) => {
        setItems(currentItems => currentItems.filter(item => item.id_producto !== productId));
    };

    const updateQuantity = async (
        productId: number, 
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

    const subtotal = useMemo(() => {
        return items.reduce((acc, item) => {
            // El precio es por caja, así que multiplicamos directamente por la cantidad de cajas
            return acc + (item.precio * item.quantity);
        }, 0);
    }, [items]);

    const total = useMemo(() => {
        return items.reduce((acc, item) => {
            // El precio es por caja, así que multiplicamos directamente por la cantidad de cajas
            const precioBase = item.precio * item.quantity;
            
            // Aplicar descuento si existe
            if (item.descuento && item.descuento > 0) {
                const descuento = (precioBase * item.descuento) / 100;
                return acc + (precioBase - descuento);
            }
            return acc + precioBase;
        }, 0);
    }, [items]);

    const totalWithDiscount = useMemo(() => {
        return total; // El total ya incluye el descuento
    }, [total]);

    const tax = useMemo(() => {
        return total * 0.18; // Calculamos el ITBIS sobre el total con descuento
    }, [total]);

    const totalAmount = useMemo(() => {
        return total + tax; // Sumamos el ITBIS al total con descuento
    }, [total, tax]);

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem('cart');
    };

    const value = {
        items,
        addItem,
        removeItem,
        updateQuantity,
        subtotal,
        total,
        tax,
        totalAmount,
        totalWithDiscount,
        clearCart,
        itemCount,
        deliveryAddress,
        setDeliveryAddress
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