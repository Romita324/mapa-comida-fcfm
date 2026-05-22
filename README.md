# Beauchef Eats - Mapa de Comida FCFM (MVP Final V2)

Bienvenido al repositorio oficial del MVP **Beauchef Eats**, una solución digital centralizada para la búsqueda y gestión de opciones de alimentación en los alrededores de la Facultad de Ciencias Físicas y Matemáticas (FCFM) de la Universidad de Chile (Beauchef 850).

Este prototipo reactivo ha sido desarrollado utilizando **React (Vite)**, **Tailwind CSS v3** y **React Leaflet**, aplicando altos estándares estéticos (fuente Google Outfit, glassmorphism, micro-transiciones, tema claro/oscuro dinámico y simulador de dispositivo dual).

---

## 🚀 Instrucciones de Clonación y Ejecución Local

Para clonar y ejecutar el entorno de desarrollo local paso a paso, sigue las instrucciones universales indicadas a continuación:

### 1. Clonar el repositorio
Abre una terminal y clona la rama temática de desarrollo:
```bash
git clone https://github.com/Romita324/mapa-comida-fcfm.git
cd mapa-comida-fcfm
```

### 2. Instalar dependencias
Instala todos los paquetes requeridos por el proyecto (incluyendo Leaflet y Tailwind CSS):
```bash
npm install
```

### 3. Ejecutar el servidor de desarrollo
Inicia el entorno de desarrollo local con soporte de recarga en caliente (HMR):
```bash
npm run dev
```

Una vez que el comando finalice, abre tu navegador e ingresa a la dirección local que aparece en la consola (usualmente `http://localhost:5173`).

---

## 🛠️ Arquitectura y Nuevas Características (V2)

Este MVP V2 implementa características avanzadas para el ecosistema de la comunidad:

### 1. Perfiles de Usuario Estrictos
- **Comensal (Estudiante/Funcionario/Profesor)**: Busca locales en el mapa, aplica filtros de distancia y categorías, visualiza si aceptan convenio JUNAEB, reporta comentarios trolls, guarda favoritos en su cuenta y postula para convertirse en moderador.
- **Vendedor (Locatario)**: Dispone de un selector de local para gestionar la disponibilidad. Puede solicitar el ingreso de un nuevo local mediante un portal integrado (esperando aprobación del Admin) y, una vez aprobado, tiene control total sobre el estado operativo (Abierto / Cerrado) y la disponibilidad de stock en caliente.
- **Administrador (Moderador)**: Panel dedicado a resolver denuncias de trolls (con opción de banear usuarios y borrar comentarios), aprobar postulaciones de nuevos locales de vendedores (añadiéndolos al mapa reactivamente) e integrar solicitudes de comensales a moderadores. Cuenta con una consola terminal con un **Log de Auditoría Inmutable** para asegurar la transparencia anti-colusión.
- **Invitado**: Visualiza de solo lectura el mapa interactivo y los locales georeferenciados. Se le inhabilitan o restringen las opciones de favoritos, postulación a moderador y denuncias.

### 2. Restricción Geográfica Crítica (Geofencing)
El mapa interactivo renderiza locales ubicados estrictamente dentro de un **radio máximo de 3.0 km** centrado en la FCFM (`[-33.4581, -70.6642]`). El slider dinámico de la barra lateral permite filtrar este radio de manera fluida entre 0.1 y 3.0 km.

### 3. Simulador de Dispositivo Dual
El selector superior "Pantalla" vs "Móvil" permite alternar la visualización:
- **Modo Pantalla**: Vista estándar de escritorio para navegadores web.
- **Modo Móvil**: Encapsula y renderiza la aplicación completa en un chassis de teléfono móvil con notch, barra de estado simulada, batería reactiva e indicador de inicio táctil, permitiendo auditar la respuesta responsive y las interacciones móviles para todos los roles.

### 4. Controlador de Temas Global (Claro / Oscuro / Sistema)
Inyectado en la raíz de la SPA, el usuario puede alternar entre:
- **Modo Claro (☀️)**: Interfaz limpia y luminosa con tonos neutros suaves.
- **Modo Oscuro (🌙)**: Interfaz premium en tonos oscuros profundos y Slate/Indigo.
- **Sincronización del Sistema (💻)**: Lee el media query de preferencia del dispositivo (`prefers-color-scheme`) y se ajusta automáticamente en caliente.
Las capas de mapas de Leaflet cambian dinámicamente sus tiles (CartsDB Dark Matter para oscuro y CartoDB Voyager para claro) al alternar el tema.

### 5. Notificaciones Reactivas en Vivo (IS Scoping)
- **Campana en Navbar**: Abre una bandeja de notificaciones en vivo que almacena las actualizaciones de estado de locales o promociones de la FCFM.
- **Cambios en Favoritos**: Si un local marcado como favorito por el Comensal cambia su disponibilidad o abre/cierra, se gatilla una alerta especial en la bandeja y un Toast de color rosa personalizado en pantalla.
- **Resumen de Reseñas Votadas**: Modal interactivo que rescata las 3 reseñas de la comunidad que han obtenido más votos de utilidad (`votosUtilidad`), presentándolas en formato de podio de honor (Oro, Plata y Bronce).

---

## 📦 Comandos de Validación para Producción

Para asegurar la calidad del código, puedes ejecutar:
- **Linteador ESLint**: `npm run lint` (verifica que no existan errores de código o advertencias).
- **Compilador de Producción**: `npm run build` (verifica el correcto empaquetado del bundle final en la carpeta `/dist`).
