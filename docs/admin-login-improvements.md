# 🔒 Mejoras en el Sistema de Login del Panel de Administración

Este documento detalla las mejoras propuestas para el sistema de login del panel de administración (`/admin`) de AgenciAlquimia. El objetivo es reforzar el control de acceso, comunicar claramente la política de registro, y guiar a los clientes potenciales hacia el proceso de "primera llamada/registro vía chat" como requisito para obtener credenciales.

## 1. 🎯 Objetivo de la Mejora

*   **Reforzar la exclusividad:** Asegurar que solo Matías (o usuarios autorizados por él) tengan acceso directo al panel.
*   **Comunicar la política de acceso:** Informar a los usuarios externos (clientes potenciales) que el registro no es abierto.
*   **Guiar al proceso de venta/registro:** Dirigir a los clientes potenciales a interactuar a través del chat o la primera llamada para obtener acceso, integrando el login en el funnel de ventas.

## 2. 🎨 Cambios en la Interfaz de Usuario (UI)

### 2.1. Candados Visuales en Inputs

*   **Ubicación:** Junto al borde izquierdo de los campos `email` y `contraseña` en el formulario de login.
*   **Icono:** Un icono de candado cerrado (ej., `lucide-lock` o similar) que indique visualmente que los campos están "bloqueados" o restringidos.
*   **Funcionalidad:** Los candados serán puramente visuales y no impedirán la entrada de texto por parte del usuario, pero su presencia transmitirá el mensaje de "acceso restringido".

### 2.2. Mensaje Explicativo bajo la Tarjeta de Login

*   **Ubicación:** Inmediatamente debajo del componente `<Card>` o contenedor principal del formulario de login.
*   **Contenido del Mensaje:** Un texto claro y conciso que explique la política de acceso y el proceso para obtener credenciales. Ejemplo de texto:

    > "Este panel es privado. Para desbloquear el acceso y obtener tus credenciales, por favor, agenda tu primera llamada de descubrimiento o inicia el proceso de registro a través de nuestro chat inteligente. Estamos aquí para ayudarte a empezar."

*   **Elementos Opcionales:**
    *   Un enlace al chat de la web (`/chat` o similar) o un `mailto:` con un asunto predefinido.
    *   Un botón para "Agendar Llamada" que enlace al calendario de Matías o a un formulario de contacto.

## 3. ⚙️ Cambios Técnicos Necesarios

### 3.1. Modificación del Componente de Login (`app/admin/login/page.tsx`)

*   **Añadir Iconos de Candado:** Integrar un icono SVG o de una librería de iconos (ej. Lucide React, si ya se usa) junto a los inputs de email y contraseña.
*   **Inyectar Texto Explicativo:** Añadir el bloque de texto con enlaces y/o botones debajo del formulario de login. Asegurarse de que esté estilizado con TailwindCSS v4 para integrarse con el tema Dark Charcoal/Esmeralda.

### 3.2. Estilos y Posicionamiento

*   Ajustar los estilos CSS (Tailwind) para que los iconos de candado se muestren correctamente dentro o junto a los inputs sin romper el layout.
*   Asegurar el espaciado adecuado para el mensaje explicativo.

## 4. 🗺️ Roadmap de Implementación

1.  **Diseño Visual:** Maquetar los candados y el texto en el componente de login (`app/admin/login/page.tsx`).
2.  **Redacción Final:** Confirmar el texto exacto del mensaje explicativo con Matías.
3.  **Integración de Enlaces/Botones:** Añadir enlaces al chat o al sistema de agendamiento de llamadas.
4.  **Testing:** Probar la UI en diferentes tamaños de pantalla para asegurar una visualización correcta.

---

**Fecha de Creación:** 2026-08-21
**Autor:** Mercurio (Agente IA de OpenClaw)
