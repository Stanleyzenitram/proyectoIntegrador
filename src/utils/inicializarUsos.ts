import { supabase } from '../services/supabase';

export const inicializarUsos = async () => {
    try {
        console.log('🚀 Inicializando sistema de usos...');

        // Crear tabla usos_producto si no existe
        const { error: createUsosError } = await supabase.rpc('create_table_if_not_exists', {
            table_name: 'usos_producto',
            create_sql: `
                CREATE TABLE IF NOT EXISTS usos_producto (
                    id SERIAL PRIMARY KEY,
                    nombre VARCHAR(100) UNIQUE NOT NULL,
                    descripcion TEXT,
                    activo BOOLEAN DEFAULT true,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        });

        if (createUsosError) {
            console.log('Tabla usos_producto ya existe o no se pudo crear');
        } else {
            console.log('✅ Tabla usos_producto creada/verificada');
        }

        // Crear tabla preferencias_uso si no existe
        const { error: createPrefError } = await supabase.rpc('create_table_if_not_exists', {
            table_name: 'preferencias_uso',
            create_sql: `
                CREATE TABLE IF NOT EXISTS preferencias_uso (
                    id SERIAL PRIMARY KEY,
                    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                    uso_id INTEGER NOT NULL REFERENCES usos_producto(id) ON DELETE CASCADE,
                    prioridad INTEGER CHECK (prioridad >= 1 AND prioridad <= 5) DEFAULT 3,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(usuario_id, uso_id)
                );
            `
        });

        if (createPrefError) {
            console.log('Tabla preferencias_uso ya existe o no se pudo crear');
        } else {
            console.log('✅ Tabla preferencias_uso creada/verificada');
        }

        // Crear índices para mejorar el rendimiento
        const { error: indexError } = await supabase.rpc('create_index_if_not_exists', {
            index_name: 'idx_preferencias_uso_usuario',
            table_name: 'preferencias_uso',
            create_sql: 'CREATE INDEX IF NOT EXISTS idx_preferencias_uso_usuario ON preferencias_uso(usuario_id);'
        });

        if (indexError) {
            console.log('Índices ya existen o no se pudieron crear');
        } else {
            console.log('✅ Índices creados/verificados');
        }

        // Insertar usos por defecto
        const usosPorDefecto = [
            { nombre: 'Gaje Rustico', descripcion: 'Para ambientes rústicos y tradicionales' },
            { nombre: 'Gaje Moderno', descripcion: 'Para ambientes contemporáneos y minimalistas' },
            { nombre: 'Gaje Clásico', descripcion: 'Para ambientes elegantes y atemporales' },
            { nombre: 'Gaje Industrial', descripcion: 'Para ambientes industriales y urbanos' },
            { nombre: 'Gaje Mediterráneo', descripcion: 'Para ambientes cálidos y acogedores' },
            { nombre: 'Gaje Escandinavo', descripcion: 'Para ambientes nórdicos y funcionales' },
            { nombre: 'Gaje Oriental', descripcion: 'Para ambientes asiáticos y zen' },
            { nombre: 'Gaje Bohemio', descripcion: 'Para ambientes artísticos y eclécticos' },
            { nombre: 'Gaje Vintage', descripcion: 'Para ambientes retro y nostálgicos' },
            { nombre: 'Gaje Lujo', descripcion: 'Para ambientes premium y exclusivos' }
        ];

        for (const uso of usosPorDefecto) {
            const { error: insertError } = await supabase
                .from('usos_producto')
                .upsert({
                    ...uso,
                    activo: true
                }, {
                    onConflict: 'nombre',
                    ignoreDuplicates: false
                });

            if (insertError) {
                console.log(`Uso ${uso.nombre} ya existe o no se pudo insertar`);
            } else {
                console.log(`✅ Uso "${uso.nombre}" insertado`);
            }
        }

        console.log('🎉 Sistema de usos inicializado correctamente');
        return true;

    } catch (error) {
        console.error('❌ Error inicializando sistema de usos:', error);
        return false;
    }
};

// Función para verificar si las tablas existen
export const verificarTablasUsos = async () => {
    try {
        const { data: usos, error: usosError } = await supabase
            .from('usos_producto')
            .select('count')
            .limit(1);

        const { data: pref, error: prefError } = await supabase
            .from('preferencias_uso')
            .select('count')
            .limit(1);

        return !usosError && !prefError;
    } catch (error) {
        return false;
    }
};
