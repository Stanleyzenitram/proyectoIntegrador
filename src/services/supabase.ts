import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseKey) {
    throw new Error("❌ Falta configurar las variables de entorno de Supabase");
}

// Exporta supabase correctamente
export const supabase = createClient(supabaseUrl, supabaseKey);



