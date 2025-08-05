import OpenAI from 'openai';

// Verificar si la API key está disponible
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true
}) : null;

const fallbackResponses = {
  greeting: "¡Hola! Soy el asistente virtual. En este momento estoy operando en modo limitado debido a problemas de conectividad con el servidor.",
  default: "Lo siento, actualmente estoy operando en modo limitado. Por favor, contacta con servicio al cliente para asistencia más detallada.",
  product: "Para información sobre productos específicos, por favor visita nuestra sección de productos o contacta con un representante.",
  help: "Puedo proporcionarte información básica. Para asistencia más detallada, por favor contacta con nuestro equipo de soporte.",
};

export const generateAIResponse = async (message: string) => {
  // Si no hay API key, usar respuestas de fallback
  if (!openai) {
    const messageLower = message.toLowerCase();
    if (messageLower.includes('hola') || messageLower.includes('buenos días') || messageLower.includes('buenas')) {
      return fallbackResponses.greeting;
    } else if (messageLower.includes('producto') || messageLower.includes('artículo')) {
      return fallbackResponses.product;
    } else if (messageLower.includes('ayuda') || messageLower.includes('ayudar')) {
      return fallbackResponses.help;
    }
    return fallbackResponses.default;
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "Eres un asistente de atención al cliente amable y profesional. Tu objetivo es ayudar a resolver problemas y dudas de los clientes de manera efectiva y cordial."
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "gpt-3.5-turbo",
    });

    return completion.choices[0]?.message?.content || "Lo siento, no pude procesar tu solicitud.";
  } catch (error) {
    console.error('Error al generar respuesta:', error);
    
    // Determinar qué respuesta de fallback usar basado en el mensaje del usuario
    const messageLower = message.toLowerCase();
    if (messageLower.includes('hola') || messageLower.includes('buenos días') || messageLower.includes('buenas')) {
      return fallbackResponses.greeting;
    } else if (messageLower.includes('producto') || messageLower.includes('artículo')) {
      return fallbackResponses.product;
    } else if (messageLower.includes('ayuda') || messageLower.includes('ayudar')) {
      return fallbackResponses.help;
    }
    
    return fallbackResponses.default;
  }
}; 