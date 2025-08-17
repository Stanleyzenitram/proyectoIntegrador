// Script para obtener los datos reales de estilos y materiales de la base de datos
// Este archivo es temporal para obtener los IDs reales

import { supabase } from '../services/supabase';

export async function obtenerEstilosReales() {
    try {
        const { data, error } = await supabase
            .from('estilos')
            .select('id_estilo, nombre_estilo')
            .order('nombre_estilo');
        
        if (error) throw error;
        
        console.log('Estilos disponibles:', data);
        return data || [];
    } catch (error) {
        console.error('Error al obtener estilos:', error);
        return [];
    }
}

export async function obtenerMaterialesReales() {
    try {
        const { data, error } = await supabase
            .from('materiales')
            .select('id_materiales, nombre_materiales')
            .order('nombre_materiales');
        
        if (error) throw error;
        
        console.log('Materiales disponibles:', data);
        return data || [];
    } catch (error) {
        console.error('Error al obtener materiales:', error);
        return [];
    }
}

export async function obtenerCategoriasReales() {
    try {
        const { data, error } = await supabase
            .from('categorias')
            .select('id_categoria, nombre_categoria')
            .order('nombre_categoria');
        
        if (error) throw error;
        
        console.log('Categorías disponibles:', data);
        return data || [];
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        return [];
    }
}

// Función para ejecutar y mostrar todos los datos
export async function mostrarTodosLosDatos() {
    console.log('=== OBTENIENDO DATOS REALES DE LA BASE DE DATOS ===');
    
    const estilos = await obtenerEstilosReales();
    const materiales = await obtenerMaterialesReales();
    const categorias = await obtenerCategoriasReales();
    
    console.log('\n=== RESUMEN ===');
    console.log('Estilos:', estilos.length);
    console.log('Materiales:', materiales.length);
    console.log('Categorías:', categorias.length);
    
    return { estilos, materiales, categorias };
}
