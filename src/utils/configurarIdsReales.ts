// Script para obtener y configurar automáticamente los IDs reales de la base de datos

import { supabase } from '../services/supabase';

export async function configurarIdsReales() {
    console.log('🔍 Obteniendo IDs reales de la base de datos...');
    
    try {
        // Obtener estilos
        const { data: estilos, error: errorEstilos } = await supabase
            .from('estilos')
            .select('id_estilo, nombre_estilo')
            .order('nombre_estilo');

        // Obtener materiales
        const { data: materiales, error: errorMateriales } = await supabase
            .from('materiales')
            .select('id_materiales, nombre_materiales')
            .order('nombre_materiales');

        if (errorEstilos || errorMateriales) {
            console.error('Error al obtener datos:', { errorEstilos, errorMateriales });
            return;
        }

        console.log('\n📋 ESTILOS DISPONIBLES:');
        estilos?.forEach((estilo, index) => {
            console.log(`${index + 1}. ID: ${estilo.id_estilo} - ${estilo.nombre_estilo}`);
        });

        console.log('\n🧱 MATERIALES DISPONIBLES:');
        materiales?.forEach((material, index) => {
            console.log(`${index + 1}. ID: ${material.id_materiales} - ${material.nombre_materiales}`);
        });

        // Generar código de mapeo sugerido
        console.log('\n🔧 CÓDIGO SUGERIDO PARA ACTUALIZAR:');
        console.log('\n// Actualizar en src/utils/preferenciasCategorias.ts');
        
        // Sugerir mapeo de estilos basado en nombres comunes
        const mapeoEstilos = generarMapeoEstilos(estilos || []);
        console.log('\nexport const CATEGORIAS_ESTILOS: CategoriaPreferencia[] = [');
        mapeoEstilos.forEach(mapeo => {
            console.log(`    {
        id: '${mapeo.categoria}',
        nombre: '${mapeo.nombre}',
        descripcion: '${mapeo.descripcion}',
        mapeo: {
            campo: 'id_estilo',
            valores: [${mapeo.ids.join(', ')}] // ${mapeo.nombres.join(', ')}
        }
    },`);
        });
        console.log('];');

        // Sugerir mapeo de materiales
        const mapeoMateriales = generarMapeoMateriales(materiales || []);
        console.log('\nexport const CATEGORIAS_MATERIALES: CategoriaPreferencia[] = [');
        mapeoMateriales.forEach(mapeo => {
            console.log(`    {
        id: '${mapeo.categoria}',
        nombre: '${mapeo.nombre}',
        descripcion: '${mapeo.descripcion}',
        mapeo: {
            campo: 'id_materiales',
            valores: [${mapeo.ids.join(', ')}] // ${mapeo.nombres.join(', ')}
        }
    },`);
        });
        console.log('];');

        return { estilos, materiales };

    } catch (error) {
        console.error('❌ Error al configurar IDs reales:', error);
    }
}

function generarMapeoEstilos(estilos: any[]) {
    const mapeos = [
        {
            categoria: 'estilo_rustico',
            nombre: 'Rústico',
            descripcion: 'Estilo natural y tradicional',
            palabrasClave: ['rustico', 'rural', 'tradicional', 'natural', 'campestre']
        },
        {
            categoria: 'estilo_moderno',
            nombre: 'Moderno',
            descripcion: 'Estilo contemporáneo y minimalista',
            palabrasClave: ['moderno', 'contemporaneo', 'minimalista', 'actual']
        },
        {
            categoria: 'estilo_ejecutivo',
            nombre: 'Ejecutivo',
            descripcion: 'Estilo elegante y profesional',
            palabrasClave: ['ejecutivo', 'elegante', 'profesional', 'corporativo', 'formal']
        },
        {
            categoria: 'estilo_clasico',
            nombre: 'Clásico',
            descripcion: 'Estilo tradicional y atemporal',
            palabrasClave: ['clasico', 'tradicional', 'atemporal', 'vintage']
        }
    ];

    return mapeos.map(mapeo => {
        const estilosCoincidentes = estilos.filter(estilo =>
            mapeo.palabrasClave.some(palabra =>
                estilo.nombre_estilo.toLowerCase().includes(palabra)
            )
        );

        return {
            ...mapeo,
            ids: estilosCoincidentes.map(e => e.id_estilo),
            nombres: estilosCoincidentes.map(e => e.nombre_estilo)
        };
    }).filter(mapeo => mapeo.ids.length > 0);
}

function generarMapeoMateriales(materiales: any[]) {
    const mapeos = [
        {
            categoria: 'ceramica_natural',
            nombre: 'Cerámica Natural',
            descripcion: 'Materiales de cerámica tradicional',
            palabrasClave: ['ceramica', 'ceramico', 'natural', 'tradicional']
        },
        {
            categoria: 'porcelanato',
            nombre: 'Porcelanato',
            descripcion: 'Material porcelánico de alta resistencia',
            palabrasClave: ['porcelanato', 'porcelanico', 'porcelana']
        },
        {
            categoria: 'gres',
            nombre: 'Gres',
            descripcion: 'Material de gres cerámico',
            palabrasClave: ['gres', 'gress']
        }
    ];

    return mapeos.map(mapeo => {
        const materialesCoincidentes = materiales.filter(material =>
            mapeo.palabrasClave.some(palabra =>
                material.nombre_materiales.toLowerCase().includes(palabra)
            )
        );

        return {
            ...mapeo,
            ids: materialesCoincidentes.map(m => m.id_materiales),
            nombres: materialesCoincidentes.map(m => m.nombre_materiales)
        };
    }).filter(mapeo => mapeo.ids.length > 0);
}

// Función para ejecutar desde la consola
export async function ejecutarConfiguracion() {
    await configurarIdsReales();
    console.log('\n💡 Copia el código sugerido y actualiza src/utils/preferenciasCategorias.ts');
}
