/**
 * MOCK DATA - MVP MAPA DE COMIDA BEAUCHEF
 * Este archivo simula la persistencia de datos para el prototipo.
 */

export const locales = [
  {
    id: 1,
    nombre: "El Carrito del Tío Beauchef",
    coordenadas: [-33.4572, -70.6635], // Cerca de Blanco Encalada
    distanciaKm: 0.2,
    aceptaJunaeb: true,
    estadoServicio: "Abierto",
    categoria: "Comida Rápida",
    tags: ["Casero", "Bajo en Sodio"],
    menu: [
      { item: "Completo Italiano", precio: 2500 },
      { item: "As de Vacuno", precio: 3200 }
    ]
  },
  {
    id: 2,
    nombre: "Casino Central FCFM",
    coordenadas: [-33.4581, -70.6642], // Interior Facultad
    distanciaKm: 0.1,
    aceptaJunaeb: true,
    estadoServicio: "Abierto",
    categoria: "Almuerzos",
    tags: ["Saludable", "Vegetariana"],
    menu: [
      { item: "Menú del Día (Fondo + Ensalada)", precio: 3500 },
      { item: "Opción Vegetariana", precio: 3500 }
    ]
  },
  {
    id: 3,
    nombre: "Pizzería Universitaria",
    coordenadas: [-33.4595, -70.6610], // Hacia Av. Matta
    distanciaKm: 1.4,
    aceptaJunaeb: false,
    estadoServicio: "Cerrado",
    categoria: "Comida Rápida",
    tags: ["Vegetariana"],
    menu: [
      { item: "Pizza Individual Pepperoni", precio: 4500 },
      { item: "Promo 2x1 Martes", precio: 8990 }
    ]
  },
  {
    id: 4,
    nombre: "Veggie Beauchef",
    coordenadas: [-33.4550, -70.6620], // Hacia Parque O'Higgins
    distanciaKm: 0.8,
    aceptaJunaeb: true,
    estadoServicio: "Sin Stock",
    categoria: "Vegana",
    tags: ["Vegana", "Sin Gluten", "Apto para Celíacos"],
    menu: [
      { item: "Bowl de Falafel", precio: 4200 },
      { item: "Hamburgesa de Lentejas", precio: 3800 }
    ]
  }
];

export const reseñas = [
  {
    id: 101,
    localId: 1,
    usuario: "javiera_fcfm",
    calificacion: 5,
    comentario: "El tío siempre salva con los completos después de un control.",
    reportado: false,
    votosUtilidad: 42
  },
  {
    id: 102,
    localId: 2,
    usuario: "diego_inge",
    calificacion: 3,
    comentario: "La comida es buena, pero la fila para pagar el ticket es eterna.",
    reportado: false,
    votosUtilidad: 28
  },
  {
    id: 103,
    localId: 3,
    usuario: "bot_troll_99",
    calificacion: 1,
    comentario: "Este lugar no existe, vayan a mi local mejor.",
    reportado: false,
    votosUtilidad: 1
  },
  {
    id: 104,
    localId: 2,
    usuario: "camila_fcfm",
    calificacion: 4,
    comentario: "Tienen opciones vegetarianas y el postre de manzana es increíble.",
    reportado: false,
    votosUtilidad: 35
  },
  {
    id: 105,
    localId: 4,
    usuario: "antonio_fcfm",
    calificacion: 5,
    comentario: "Los bowls de falafel son abundantes y sanos. ¡Muy recomendado!",
    reportado: false,
    votosUtilidad: 19
  }
];

export const reportesSeguridad = [
  {
    id: 501,
    reseñaId: 103,
    estado: "Pendiente",
    motivo: "Comentario malicioso / Troll"
  },
  {
    id: 502,
    reseñaId: 102,
    estado: "Pendiente",
    motivo: "Contenido irrelevante o spam"
  }
];

export const logAuditoriaAdmin = [
  {
    id: 901,
    accion: "Admin_Master eliminó reseña ID 88 por lenguaje ofensivo",
    fecha: "2023-10-25 14:30:15"
  },
  {
    id: 902,
    accion: "Moderador_02 bloqueó usuario 'TrollHunter' por reportes masivos falsos",
    fecha: "2023-10-26 09:12:40"
  }
];