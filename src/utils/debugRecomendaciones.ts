// Script temporal para debuggear recomendaciones y obtener IDs reales

import { supabase } from '../services/supabase';

export async function debugearSistemaRecomendaciones() {
    console.log('🚀 INICIANDO DEBUG DEL SISTEMA DE RECOMENDACIONES...\n');

    try {
        // 1. Verificar datos básicos
        console.log('📊 1. VERIFICANDO DATOS BÁSICOS:');
        
        const { data: estilos, error: errorEstilos } = await supabase
            .from('estilos')
            .select('id_estilo, nombre_estilo');
            
        const { data: materiales, error: errorMateriales } = await supabase
            .from('materiales')
            .select('id_materiales, nombre_materiales');
            
        const { data: productos, error: errorProductos } = await supabase
            .from('productos')
            .select('id_producto, nombre_producto, colorDom, id_estilo, id_materiales, precio')
            .eq('disponibilidad', true)
            .limit(5);

        if (errorEstilos || errorMateriales || errorProductos) {
            console.error('❌ Error obteniendo datos:', { errorEstilos, errorMateriales, errorProductos });
            return;
        }

        console.log(`   ✅ Estilos disponibles: ${estilos?.length || 0}`);
        console.log(`   ✅ Materiales disponibles: ${materiales?.length || 0}`);
        console.log(`   ✅ Productos disponibles: verificando muestra de ${productos?.length || 0}...\n`);

        // 2. Mostrar datos detallados
        console.log('📋 2. ESTILOS DISPONIBLES:');
        estilos?.forEach((e, i) => {
            console.log(`   ${i + 1}. ID: ${e.id_estilo} - "${e.nombre_estilo}"`);
        });

        console.log('\n📋 3. MATERIALES DISPONIBLES:');
        materiales?.forEach((m, i) => {
            console.log(`   ${i + 1}. ID: ${m.id_materiales} - "${m.nombre_materiales}"`);
        });

        console.log('\n📋 4. MUESTRA DE PRODUCTOS:');
        productos?.forEach((p, i) => {
            console.log(`   ${i + 1}. "${p.nombre_producto}"`);
            console.log(`      - Color: "${p.colorDom || 'Sin color'}"`);
            console.log(`      - Estilo ID: ${p.id_estilo || 'Sin estilo'}`);
            console.log(`      - Material ID: ${p.id_materiales || 'Sin material'}`);
            console.log(`      - Precio: RD$ ${p.precio}`);
        });

        // 3. Generar mapeo sugerido
        console.log('\n🔧 5. MAPEO SUGERIDO PARA ACTUALIZAR EL CÓDIGO:');
        console.log('\n// Actualizar en src/utils/preferenciasCategorias.ts\n');

        // Generar mapeo inteligente de estilos
        const mapeoEstilos = generarMapeoInteligente(estilos || [], 'estilos');
        console.log('export const CATEGORIAS_ESTILOS: CategoriaPreferencia[] = [');
        mapeoEstilos.forEach(mapeo => {
            console.log(`    {
        id: '${mapeo.categoria}',
        nombre: '${mapeo.nombre}',
        descripcion: '${mapeo.descripcion}',
        mapeo: {
            campo: 'id_estilo',
            valores: [${mapeo.ids.join(', ')}] // ${mapeo.coincidencias.join(', ')}
        }
    },`);
        });
        console.log('];\n');

        // Generar mapeo inteligente de materiales
        const mapeoMateriales = generarMapeoInteligente(materiales || [], 'materiales');
        console.log('export const CATEGORIAS_MATERIALES: CategoriaPreferencia[] = [');
        mapeoMateriales.forEach(mapeo => {
            console.log(`    {
        id: '${mapeo.categoria}',
        nombre: '${mapeo.nombre}',
        descripcion: '${mapeo.descripcion}',
        mapeo: {
            campo: 'id_materiales',
            valores: [${mapeo.ids.join(', ')}] // ${mapeo.coincidencias.join(', ')}
        }
    },`);
        });
        console.log('];\n');

        // 4. Verificar preferencias guardadas
        console.log('👤 6. VERIFICANDO PREFERENCIAS GUARDADAS:');
        const { data: preferenciasGuardadas, error: errorPref } = await supabase
            .from('preferencias_categorias')
            .select('*');

        if (errorPref) {
            console.error('❌ Error obteniendo preferencias:', errorPref);
        } else {
            console.log(`   ✅ Preferencias guardadas en BD: ${preferenciasGuardadas?.length || 0}`);
            preferenciasGuardadas?.forEach((pref, i) => {
                console.log(`   ${i + 1}. Cliente ${pref.idclientes}:`);
                console.log(`      - Color: ${pref.categoria_color || 'No seleccionado'}`);
                console.log(`      - Estilo: ${pref.categoria_estilo || 'No seleccionado'}`);
                console.log(`      - Material: ${pref.categoria_material || 'No seleccionado'}`);
                console.log(`      - Precio: ${pref.categoria_precio || 'No seleccionado'}`);
            });
        }

        console.log('\n✨ DEBUG COMPLETADO!\n');

        return { estilos, materiales, productos, preferenciasGuardadas };

    } catch (error) {
        console.error('💥 Error durante el debug:', error);
    }
}

// Función para generar mapeo inteligente basado en nombres
function generarMapeoInteligente(items: any[], tipo: 'estilos' | 'materiales') {
    const categorias = tipo === 'estilos' ? [
        {
            categoria: 'estilo_rustico',
            nombre: 'Rústico',
            descripcion: 'Estilo natural y tradicional',
            palabrasClave: ['rustico', 'rural', 'tradicional', 'natural', 'campestre', 'madera']
        },
        {
            categoria: 'estilo_moderno',
            nombre: 'Moderno',
            descripcion: 'Estilo contemporáneo y minimalista',
            palabrasClave: ['moderno', 'contemporaneo', 'minimalista', 'actual', 'simple', 'clean']
        },
        {
            categoria: 'estilo_ejecutivo',
            nombre: 'Ejecutivo',
            descripcion: 'Estilo elegante y profesional',
            palabrasClave: ['ejecutivo', 'elegante', 'profesional', 'corporativo', 'formal', 'lujo']
        },
        {
            categoria: 'estilo_clasico',
            nombre: 'Clásico',
            descripcion: 'Estilo tradicional y atemporal',
            palabrasClave: ['clasico', 'tradicional', 'atemporal', 'vintage', 'retro']
        }
    ] : [
        {
            categoria: 'ceramica_natural',
            nombre: 'Cerámica Natural',
            descripcion: 'Materiales de cerámica tradicional',
            palabrasClave: ['ceramica', 'ceramico', 'natural', 'tradicional', 'terracota']
        },
        {
            categoria: 'porcelanato',
            nombre: 'Porcelanato',
            descripcion: 'Material porcelánico de alta resistencia',
            palabrasClave: ['porcelanato', 'porcelanico', 'porcelana', 'resistente']
        },
        {
            categoria: 'gres',
            nombre: 'Gres',
            descripcion: 'Material de gres cerámico',
            palabrasClave: ['gres', 'gress']
        }
    ];

    return categorias.map(cat => {
        const coincidencias = items.filter(item => {
            const nombre = tipo === 'estilos' ? item.nombre_estilo : item.nombre_materiales;
            return cat.palabrasClave.some(palabra =>
                nombre.toLowerCase().includes(palabra.toLowerCase())
            );
        });

        return {
            ...cat,
            ids: coincidencias.map(item => tipo === 'estilos' ? item.id_estilo : item.id_materiales),
            coincidencias: coincidencias.map(item => tipo === 'estilos' ? item.nombre_estilo : item.nombre_materiales)
        };
    }).filter(cat => cat.ids.length > 0); // Solo categorías con coincidencias
}

// Función para ejecutar desde la consola
export async function ejecutarDebug() {
    await debugearSistemaRecomendaciones();
    console.log('💡 Copia el código generado y actualiza src/utils/preferenciasCategorias.ts');
    console.log('💡 Luego prueba nuevamente las recomendaciones');
}
