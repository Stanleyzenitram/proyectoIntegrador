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
export interface Proveedor {
    id_proveedor?: number;
    nombre_proveedor: string;
    contacto: string;
    telefono: string;
    correo: string;
    direccion: string;
}

export interface Producto {
    id_producto: number;
    nombre_producto: string;
    descripcion: string;
    precio: number;
    stock_actual: number;
    descuento: number;
    estado: boolean;
    imagen?: string | null;
    categoria?: { nombre_categoria: string };
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