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



export type Product = {
    nombre_producto: string;
    id_categoria: number;
    descripcion?: string;
    precio: number;
    stock_actual: number;
    descuento: number;
    estado: boolean;
    imagen?: string | null; // Guardar la URL de la imagen en lugar del archivo
};
