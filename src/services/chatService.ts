interface ChatResponse {
  response: string;
  suggestions?: string[];
  action?: {
    type: 'navigate' | 'filter';
    payload: any;
  };
}

const chatResponses = {
  greeting: {
    response: "¡Hola! Soy el asistente virtual de la tienda. ¿En qué puedo ayudarte hoy?",
    suggestions: ["Ver productos", "Información de envíos", "Estado de mi pedido", "Contactar soporte"]
  },
  products: {
    response: "¡Te mostraré nuestro catálogo completo de productos!",
    action: {
      type: 'navigate' as const,
      payload: {
        path: '/'
      }
    },
    suggestions: ["Ver catálogo completo", "Productos en oferta", "Nuevos productos", "Productos más vendidos"]
  },
  offers: {
    response: "¡Te mostraré todos nuestros productos en oferta!",
    action: {
      type: 'navigate' as const,
      payload: {
        path: '/',
        filter: 'offers'
      }
    },
    suggestions: ["Ver más productos", "Filtrar por precio", "Ver categorías", "Necesito ayuda"]
  },
  shipping: {
    response: "Nuestros envíos se realizan en 24-48 horas hábiles. El costo depende de tu ubicación.",
    suggestions: ["Costos de envío", "Tiempo de entrega", "Seguimiento de pedido", "Políticas de envío"]
  },
  payment: {
    response: "Aceptamos múltiples métodos de pago: tarjetas de crédito/débito, transferencias bancarias y PayPal.",
    suggestions: ["Métodos de pago", "Problemas con el pago", "Facturación", "Descuentos disponibles"]
  },
  returns: {
    response: "Puedes devolver tu producto dentro de los primeros 30 días de la compra.",
    suggestions: ["Política de devoluciones", "Iniciar devolución", "Estado de devolución", "Reembolsos"]
  },
  help: {
    response: "Estoy aquí para ayudarte. ¿Cuál es tu consulta específica?",
    suggestions: ["Problemas técnicos", "Dudas de compra", "Contactar soporte", "Preguntas frecuentes"]
  },
  support: {
    response: "Nuestro equipo de soporte está disponible para ayudarte:\n\nJosue Morel 1-21-2928\nStanley Martinez 1-20-0001",
    suggestions: ["Ver productos", "Información de envíos", "Estado de mi pedido", "Volver al inicio"]
  },
  default: {
    response: "Entiendo tu consulta. ¿Podrías proporcionarme más detalles para ayudarte mejor?",
    suggestions: ["Ver productos", "Contactar soporte", "Preguntas frecuentes", "Hacer un pedido"]
  },
  faq: {
    response: "Aquí tienes las preguntas más frecuentes organizadas por categoría:\n\n" +
             "\n" +
             "     ENVÍOS Y ENTREGAS     \n" +
             "\n\n" +
             "1. ¿Cuál es el tiempo de entrega?\n" +
             "   ▸ 24-48 horas hábiles según tu ubicación\n\n" +
             "2. ¿Hacen envíos internacionales?\n" +
             "   ▸ No, pero proximamente estara dispoinible\n\n" +
             "3. ¿Cómo puedo rastrear mi pedido?\n" +
             "   ▸ Se Hablilitara una opcion Pronto\n\n" +
             "\n" +
             "      PAGOS Y PRECIOS      \n" +
             "\n\n" +
             "4. ¿Qué métodos de pago aceptan?\n" +
             "   ▸ Tarjetas de crédito/débito\n" +
             "   ▸ Transferencias bancarias\n" +
             "   ▸ PayPal\n\n" +
             "5. ¿Tienen descuentos para compras al mayor?\n" +
             "   ▸ Sí, contáctanos para precios especiales\n\n" +
             "\n" +
             "  DEVOLUCIONES Y GARANTÍAS  \n" +
             "\n\n" +
             "6. ¿Tienen política de devolución?\n" +
             "   ▸ Sí, 12 días para devolver tu producto\n\n" +
             "7. ¿Ofrecen garantía?\n" +
             "   ▸ Dependera de la marca del producto\n\n" +
             "╔══════════════════╗\n" +
             "      TIENDA FÍSICA        \n" +
             "╚══════════════════╝\n\n" +
             "8. ¿Tienen tienda física?\n" +
             "   ▸ Sí, visítanos en nuestra tienda principal\n\n" +
             "════════════════════════════\n\n" +
             "¿Necesitas más información sobre alguna de estas preguntas?\n" +
             "Estaré encantado de ayudarte con más detalles.",
    suggestions: [
      "Contactar soporte",
      "Ver productos",
      "Información de envíos",
      "Volver al inicio",
      "Cual es la direccion de la tienda"
    ]
  },
  location: {
    response: "La empresa tiene su sede en:\n\n" +
             "\n" +
             "   Avenida 27 de Febrero, esquina\n" +
             "   Calle Duarte\n" +
             "   Santiago de los Caballeros\n" +
             "   Santiago, República Dominicana\n" +
             "",
    suggestions: ["Ver productos", "Contactar soporte", "Preguntas frecuentes", "Volver al inicio"]
  },
  prices: {
    response: "Te mostraré los productos organizados por precio. Puedes filtrarlos según tu presupuesto.",
    action: {
      type: 'navigate' as const,
      payload: {
        path: '/',
        filter: 'prices'
      }
    },
    suggestions: [
      "Menos de $1000",
      "Entre $1000 y $5000",
      "Más de $5000",
      "Ver ofertas"
    ]
  },
  price_low: {
    response: "Aquí tienes los productos con precios menores a $1000:",
    action: {
      type: 'navigate' as const,
      payload: {
        path: '/',
        filter: 'price_low'
      }
    },
    suggestions: ["Ver más productos", "Otros rangos de precio", "Ver ofertas"]
  },
  price_medium: {
    response: "Aquí tienes los productos entre $1000 y $5000:",
    action: {
      type: 'navigate' as const,
      payload: {
        path: '/',
        filter: 'price_medium'
      }
    },
    suggestions: ["Ver más productos", "Otros rangos de precio", "Ver ofertas"]
  },
  price_high: {
    response: "Aquí tienes los productos con precios superiores a $5000:",
    action: {
      type: 'navigate' as const,
      payload: {
        path: '/',
        filter: 'price_high'
      }
    },
    suggestions: ["Ver más productos", "Otros rangos de precio", "Ver ofertas"]
  }
};

const findBestMatch = (message: string): ChatResponse => {
  const messageLower = message.toLowerCase();
  
  // Palabras clave para cada categoría
  const keywords = {
    greeting: ['hola', 'buenos días', 'buenas', 'saludos', 'hey'],
    products: ['producto', 'artículo', 'catálogo', 'precio', 'costo', 'comprar'],
    offers: ['oferta', 'descuento', 'promoción', 'rebaja', 'productos en oferta'],
    shipping: ['envío', 'enviar', 'entrega', 'shipping', 'envíos', 'recibir'],
    payment: ['pago', 'pagar', 'tarjeta', 'transferencia', 'paypal', 'precio'],
    returns: ['devolver', 'devolución', 'reembolso', 'garantía', 'cambio'],
    help: ['ayuda', 'ayudar', 'soporte', 'problema', 'duda', 'pregunta'],
    support: ['contactar soporte', 'contacto', 'atención al cliente', 'servicio al cliente', 'representante'],
    faq: ['preguntas frecuentes', 'faq', 'preguntas comunes', 'dudas frecuentes'],
    location: ['dirección', 'ubicación', 'donde', 'localización', 'tienda física', 'sede'],
    prices: ['precio', 'cuanto cuesta', 'valor', 'cuanto vale', 'costo', 'consultar precio', 'consultar precios'],
    price_low: ['barato', 'económico', 'menos de 1000', 'menor precio'],
    price_medium: ['precio medio', 'entre 1000 y 5000', 'precio intermedio'],
    price_high: ['precio alto', 'más de 5000', 'mayor precio', 'premium']
  };

  // Verificar coincidencias exactas para rangos de precio
  if (messageLower === 'menos de $1000') {
    return chatResponses.price_low;
  }

  if (messageLower === 'entre $1000 y $5000') {
    return chatResponses.price_medium;
  }

  if (messageLower === 'más de $5000') {
    return chatResponses.price_high;
  }

  // Verificar si el mensaje es sobre consulta de precios general
  if (keywords.prices.some(word => messageLower.includes(word))) {
    return chatResponses.prices;
  }

  // Verificar rangos de precio específicos
  if (keywords.price_low.some(word => messageLower.includes(word))) {
    return chatResponses.price_low;
  }

  if (keywords.price_medium.some(word => messageLower.includes(word))) {
    return chatResponses.price_medium;
  }

  if (keywords.price_high.some(word => messageLower.includes(word))) {
    return chatResponses.price_high;
  }

  // Verificar si el mensaje es una sugerencia exacta
  if (messageLower === 'productos en oferta') {
    return chatResponses.offers;
  }

  if (messageLower === 'contactar soporte') {
    return chatResponses.support;
  }

  if (messageLower === 'preguntas frecuentes') {
    return chatResponses.faq;
  }

  if (messageLower === 'cual es la direccion de la tienda') {
    return chatResponses.location;
  }

  // Encontrar la mejor coincidencia
  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => messageLower.includes(word))) {
      return chatResponses[category as keyof typeof chatResponses];
    }
  }

  return chatResponses.default;
};

export const generateResponse = async (message: string): Promise<ChatResponse> => {
  try {
    // Simular un pequeño retraso para hacer la respuesta más natural
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return findBestMatch(message);
  } catch (error) {
    console.error('Error al generar respuesta:', error);
    return chatResponses.default;
  }
}; 