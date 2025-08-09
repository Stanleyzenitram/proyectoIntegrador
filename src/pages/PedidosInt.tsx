import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { FaFileInvoice, FaShippingFast, FaCheckCircle, FaTimesCircle, FaHistory, FaBell, FaArrowLeft } from 'react-icons/fa';

interface Pedido {
    id_pedido: number;
    fecha_pedido: string;
    total: number;
    estado: string;
    metodo_pago: string;
    id_factura: number | null;
    id_cliente: number;
}

interface Notificacion {
    id: number;
    id_usuario: number;
    tipo: string;
    titulo: string;
    mensaje: string;
    leido: boolean;
    fecha: string;
}


export default function PedidosInt() {
  
  return (
    <div className=" w-full h-full flex flex-col mt-10">
        
    </div>
  )
}
