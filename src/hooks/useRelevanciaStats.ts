import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './useAuth';

interface RelevanciaStats {
    total_vistas: number;
    total_busquedas: number;
    total_clics: number;
    tiene_preferencias: boolean;
    ultima_actividad: string | null;
}

export const useRelevanciaStats = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<RelevanciaStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);

            // Obtener estadísticas de vistas
            const { count: vistasCount } = await supabase
                .from('historial_productos_vistos')
                .select('*', { count: 'exact', head: true })
                .eq('usuario_id', user?.id);

            // Obtener estadísticas de búsquedas
            const { count: busquedasCount } = await supabase
                .from('historial_busquedas')
                .select('*', { count: 'exact', head: true })
                .eq('usuario_id', user?.id);

            // Obtener estadísticas de clics
            const { count: clicsCount } = await supabase
                .from('historial_clics')
                .select('*', { count: 'exact', head: true })
                .eq('usuario_id', user?.id);

            // Verificar si tiene preferencias
            const { data: preferencias } = await supabase
                .from('preferencias_usuarios')
                .select('id')
                .eq('usuario_id', user?.id)
                .single();

            // Obtener última actividad
            const { data: ultimaActividad } = await supabase
                .from('historial_productos_vistos')
                .select('fecha_vista')
                .eq('usuario_id', user?.id)
                .order('fecha_vista', { ascending: false })
                .limit(1)
                .single();

            setStats({
                total_vistas: vistasCount || 0,
                total_busquedas: busquedasCount || 0,
                total_clics: clicsCount || 0,
                tiene_preferencias: !!preferencias,
                ultima_actividad: ultimaActividad?.fecha_vista || null
            });

        } catch (err) {
            console.error('Error al obtener estadísticas de relevancia:', err);
            setError('Error al cargar estadísticas');
        } finally {
            setLoading(false);
        }
    };

    return { stats, loading, error, refetch: fetchStats };
}; 