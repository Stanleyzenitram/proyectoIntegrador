import { useState, useEffect } from 'react';
import { configuracionService } from '../services/configuracionService';

export interface CategoriaPreferencia {
    id: string;
    nombre: string;
    descripcion: string;
    mapeo?: {
        campo: 'color' | 'precio' | 'id_categoria' | 'id_estilo' | 'id_materiales';
        valores?: string[] | number[];
        rango?: { min: number; max: number };
        condicion?: string;
    };
}

export const useConfiguracionPreferencias = () => {
    const [categoriasColores, setCategoriasColores] = useState<CategoriaPreferencia[]>([]);
    const [categoriasPrecio, setCategoriasPrecio] = useState<CategoriaPreferencia[]>([]);
    const [estilosDecorativos, setEstilosDecorativos] = useState<CategoriaPreferencia[]>([]);
    const [tiposMateriales, setTiposMateriales] = useState<CategoriaPreferencia[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cargarConfiguracion = async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar todas las categorías desde la configuración del sistema
            const [colores, precios, estilos, materiales] = await Promise.all([
                configuracionService.obtenerCategoriasColoresFormateadas(),
                configuracionService.obtenerRangosPrecioFormateados(),
                configuracionService.obtenerEstilosDecorativosFormateados(),
                configuracionService.obtenerTiposMaterialesFormateados()
            ]);

            setCategoriasColores(colores);
            setCategoriasPrecio(precios);
            console.log('📊 Estilos decorativos cargados:', estilos);
            console.log('📊 Tipos de materiales cargados:', materiales);
            setEstilosDecorativos(estilos);
            setTiposMateriales(materiales);
        } catch (err) {
            console.error('Error cargando configuración de preferencias:', err);
            setError('Error al cargar la configuración');
            
            // Fallback a configuración por defecto si hay error
            setCategoriasColores([
                {
                    id: 'neutros',
                    nombre: 'Colores Neutros',
                    descripcion: 'Colores: Blanco, Gris, Beige, Crema',
                    mapeo: {
                        campo: 'color',
                        valores: ['Blanco', 'Gris', 'Beige', 'Crema']
                    }
                },
                {
                    id: 'vibrantes',
                    nombre: 'Colores Vibrantes',
                    descripcion: 'Colores: Rojo, Azul, Verde, Amarillo, Naranja',
                    mapeo: {
                        campo: 'color',
                        valores: ['Rojo', 'Azul', 'Verde', 'Amarillo', 'Naranja']
                    }
                }
            ]);

            setCategoriasPrecio([
                {
                    id: 'bajo',
                    nombre: 'Económico',
                    descripcion: 'Productos entre $0 y $50',
                    mapeo: {
                        campo: 'precio',
                        rango: { min: 0, max: 50 }
                    }
                },
                {
                    id: 'medio',
                    nombre: 'Intermedio',
                    descripcion: 'Productos entre $51 y $150',
                    mapeo: {
                        campo: 'precio',
                        rango: { min: 51, max: 150 }
                    }
                },
                {
                    id: 'alto',
                    nombre: 'Premium',
                    descripcion: 'Productos entre $151 y $500',
                    mapeo: {
                        campo: 'precio',
                        rango: { min: 151, max: 500 }
                    }
                }
            ]);

            setEstilosDecorativos([
                {
                    id: 'rustico',
                    nombre: 'Estilo Rústico',
                    descripcion: 'Caracterizado por texturas naturales y acabados envejecidos'
                },
                {
                    id: 'moderno',
                    nombre: 'Estilo Moderno',
                    descripcion: 'Líneas limpias, minimalista y contemporáneo'
                }
            ]);

            setTiposMateriales([
                {
                    id: 'ceramica_natural',
                    nombre: 'Cerámica Natural',
                    descripcion: 'Materiales naturales y orgánicos'
                },
                {
                    id: 'porcelanato',
                    nombre: 'Porcelanato',
                    descripcion: 'Materiales de alta densidad y durabilidad'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const refrescarConfiguracion = () => {
        cargarConfiguracion();
    };

    useEffect(() => {
        cargarConfiguracion();
        
        // Escuchar eventos de actualización de configuración
        const handleConfiguracionActualizada = () => {
            console.log('🔄 Configuración actualizada, refrescando preferencias...');
            cargarConfiguracion();
        };
        
        window.addEventListener('configuracionActualizada', handleConfiguracionActualizada);
        
        return () => {
            window.removeEventListener('configuracionActualizada', handleConfiguracionActualizada);
        };
    }, []);

    return {
        categoriasColores,
        categoriasPrecio,
        estilosDecorativos,
        tiposMateriales,
        loading,
        error,
        refrescarConfiguracion
    };
};
