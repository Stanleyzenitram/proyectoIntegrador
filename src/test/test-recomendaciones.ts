// Script de prueba para verificar recomendaciones por rangos de precio
import { supabase } from '../services/supabase';
import { generarRecomendacionesPorCategorias } from '../utils/recomendacionesCategorias';

async function testRecomendacionesPrecio() {
    console.log('🧪 Probando sistema de recomendaciones por precio...');
    
    try {
        // 1. Verificar configuración del sistema
        console.log('\n📊 Verificando configuración del sistema...');
        const { data: configData, error: configError } = await supabase
            .from('configuracion_sistema')
            .select('*')
            .eq('nombre', 'rangos_precio');
            
        if (configError) {
            console.error('❌ Error obteniendo configuración:', configError);
            return;
        }
        
        console.log('✅ Configuración de rangos de precio:', configData);
        
        // 2. Verificar productos disponibles por rango de precio
        console.log('\n🔍 Verificando productos por rango de precio...');
        
        // Rango alto (151-500)
        const { data: productosAlto, error: errorAlto } = await supabase
            .from('productos')
            .select('id_producto, nombre_producto, precio, stock_actual, disponibilidad')
            .gte('precio', 151)
            .lte('precio', 500)
            .eq('disponibilidad', true)
            .gt('stock_actual', 0)
            .limit(10);
            
        if (errorAlto) {
            console.error('❌ Error obteniendo productos alto:', errorAlto);
        } else {
            console.log(`✅ Productos en rango alto (151-500): ${productosAlto?.length || 0}`);
            if (productosAlto && productosAlto.length > 0) {
                console.log('📦 Ejemplos:', productosAlto.slice(0, 3).map(p => ({
                    id: p.id_producto,
                    nombre: p.nombre_producto,
                    precio: p.precio,
                    stock: p.stock_actual
                })));
            }
        }
        
        // Rango medio (51-150)
        const { data: productosMedio, error: errorMedio } = await supabase
            .from('productos')
            .select('id_producto, nombre_producto, precio, stock_actual, disponibilidad')
            .gte('precio', 51)
            .lte('precio', 150)
            .eq('disponibilidad', true)
            .gt('stock_actual', 0)
            .limit(10);
            
        if (errorMedio) {
            console.error('❌ Error obteniendo productos medio:', errorMedio);
        } else {
            console.log(`✅ Productos en rango medio (51-150): ${productosMedio?.length || 0}`);
        }
        
        // Rango bajo (0-50)
        const { data: productosBajo, error: errorBajo } = await supabase
            .from('productos')
            .select('id_producto, nombre_producto, precio, stock_actual, disponibilidad')
            .gte('precio', 0)
            .lte('precio', 50)
            .eq('disponibilidad', true)
            .gt('stock_actual', 0)
            .limit(10);
            
        if (errorBajo) {
            console.error('❌ Error obteniendo productos bajo:', errorBajo);
        } else {
            console.log(`✅ Productos en rango bajo (0-50): ${productosBajo?.length || 0}`);
        }
        
        // 3. Verificar preferencias de usuarios
        console.log('\n👥 Verificando preferencias de usuarios...');
        const { data: preferencias, error: errorPrefs } = await supabase
            .from('preferencias_categorias')
            .select('*')
            .limit(5);
            
        if (errorPrefs) {
            console.error('❌ Error obteniendo preferencias:', errorPrefs);
        } else {
            console.log(`✅ Preferencias encontradas: ${preferencias?.length || 0}`);
            if (preferencias && preferencias.length > 0) {
                console.log('📋 Ejemplo de preferencias:', preferencias[0]);
            }
        }
        
        // 4. Probar generación de recomendaciones (si hay un usuario con preferencias)
        if (preferencias && preferencias.length > 0) {
            const usuarioTest = preferencias[0];
            console.log(`\n🎯 Probando recomendaciones para usuario ${usuarioTest.idclientes}...`);
            
            try {
                const recomendaciones = await generarRecomendacionesPorCategorias(usuarioTest.idclientes, 5);
                console.log(`✅ Recomendaciones generadas: ${recomendaciones.length}`);
                if (recomendaciones.length > 0) {
                    console.log('🏆 Top recomendaciones:', recomendaciones.slice(0, 3).map(p => ({
                        nombre: p.nombre_producto,
                        precio: p.precio,
                        score: p.score_recomendacion,
                        razon: p.razon_recomendacion
                    })));
                }
            } catch (error) {
                console.error('❌ Error generando recomendaciones:', error);
            }
        }
        
        console.log('\n✅ Prueba completada!');
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    }
}

// Ejecutar la prueba
testRecomendacionesPrecio();
