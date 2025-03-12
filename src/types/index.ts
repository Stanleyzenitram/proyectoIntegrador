export interface Client {
    name: string;
    lastName: string;
    phoneNumber: string;
    sector: string;
    postalCode: number;
    addressDetails: string;
    idType: string;
    idNumber: number;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface Empleado{
    id_usuario?: number;
    name: string;
    lastName: string;
    cedula: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    rol: string;
}

export interface Proveedor {
    id_proveedor?: number;
    nombre_proveedor: string;
    contacto: string;
    telefono: string;
    correo: string;
    direccion: string;
}

export interface Producto {
    id_producto: string;
    nombre_producto: string;
    descripcion: string;
    precio: number;
    stock_actual: number;
    imagen?: string;
    descuento?: number;
    metros_por_caja: number;
    disponibilidad: boolean;
    color: string;
    formato: string;
    estilo: {
        id_estilo: string;
        nombre_estilo: string;
    };
    material?: {
        id_materiales: string;
        nombre_materiales: string;
    };
    categoria?: {
        id_categoria: string;
        nombre_categoria: string;
    };
}

export interface Estilo {
    id_estilo?: number;
    nombre_estilo: string;
    descripcion: string;
}

export interface  Material {
    id_materiales?: number;
    nombre_materiales: string;
    uso_materiales: string;
}
export interface  Categoria {
    id_categoria?: number;
    nombre_categoria: string;
    descripcion: string;
}

export interface CartItem extends Producto {
    quantity: number;
<<<<<<< HEAD
}


export interface Cliente {
    nombre: string;
    apellido: string;
    telefono: string;
    sector: string;
    codigo_postal: string;
    detalles_direccion: string;
    tipo_documento: string;
    numero_documento: string;
    email: string;
}
=======
    metrosCuadrados: number;  // Metros cuadrados solicitados
    cajasNecesarias: number;  // Número de cajas calculado
    metrosReales: number;     // Metros cuadrados reales (basado en cajas completas)
}
>>>>>>> 1f1cd32 (Carrito y home para agregar la compra por metros y cajas)
