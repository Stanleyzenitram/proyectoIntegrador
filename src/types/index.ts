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
    id_producto?: number;
    nombre_producto: string;
    descripcion: string;
    precio: number;
    stock_actual: number;
    imagen?: string;
    descuento?: number;
    metros_por_caja: number;
    disponibilidad: boolean;
    formato: string;
    piezas_por_caja: number;
    id_estilo: number;
    id_materiales: number;
    id_categoria: number;
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
    metrosCuadrados?: number;
    cajasNecesarias?: number;
    metrosReales?: number;
    precioTotal?: number;
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
