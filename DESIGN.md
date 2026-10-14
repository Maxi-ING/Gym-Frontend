---
name: FitAnalytics AI
description: Interfaz de carbón, acero y blanco para leer y registrar entrenamiento.
colors:
  bg: '#121212'
  surface: '#1b1b1b'
  surface-raised: '#242424'
  ink: '#f2f2f0'
  muted: '#b5b5b2'
  accent: '#deded9'
  primary: '#e4e4de'
  on-primary: '#181818'
  primary-hover: '#ffffff'
  chart-actual: '#deded9'
  chart-projection: '#8c8c88'
  line: '#383838'
  soft: '#292929'
  sidebar: '#101010'
  danger-bg: '#351d29'
  danger: '#ffb7b4'
  success-bg: '#122d34'
  success: '#96dfd7'
  light-bg: '#efefec'
  light-surface: '#fff'
  light-surface-raised: '#f5f5f2'
  light-ink: '#202020'
  light-muted: '#62625f'
  light-accent: '#333330'
  light-primary: '#242424'
  light-on-primary: '#ffffff'
  light-primary-hover: '#404040'
  light-chart-actual: '#343430'
  light-chart-projection: '#73736e'
  light-line: '#d6d6d0'
  light-soft: '#e6e6df'
  light-danger-bg: '#fff1f1'
  light-danger: '#a52934'
  light-success-bg: '#eaf8f5'
  light-success: '#176657'
  auth-surface-raised: '#f7f7f4'
  calendar-trained-bg: '#174b36'
  calendar-trained-ink: '#bceccd'
  calendar-trained-line: '#377e5b'
  calendar-trained-hover: '#205e44'
  light-calendar-trained-bg: '#e2f3e8'
  light-calendar-trained-ink: '#1b5938'
  light-calendar-trained-line: '#6bb083'
typography:
  display:
    fontFamily: 'Barlow Condensed, sans-serif'
    fontSize: 'clamp(64px, 7vw, 96px)'
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: '-0.02em'
  headline:
    fontFamily: 'Barlow, system-ui, sans-serif'
    fontSize: 'clamp(28px, 2.5vw, 36px)'
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: '-0.025em'
  title:
    fontFamily: 'Barlow, system-ui, sans-serif'
    fontSize: '19px'
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: '-0.4px'
  body:
    fontFamily: 'Barlow, system-ui, sans-serif'
    fontSize: '13px'
    lineHeight: 1.8
  label:
    fontFamily: 'Barlow, system-ui, sans-serif'
    fontSize: '12px'
    fontWeight: 700
rounded:
  tag: '7px'
  calendar-day: '8px'
  field: '9px'
  button: '10px'
  radius: '12px'
  modal: '18px'
spacing:
  '8': '8px'
  '12': '12px'
  '14': '14px'
  '16': '16px'
  '18': '18px'
  '20': '20px'
  '24': '24px'
  '32': '32px'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.button}'
    padding: '11px 16px'
  button-primary-hover:
    backgroundColor: '{colors.primary-hover}'
  button-secondary:
    backgroundColor: '{colors.surface-raised}'
    textColor: '{colors.ink}'
    rounded: '{rounded.button}'
    padding: '11px 16px'
  button-ghost:
    backgroundColor: 'transparent'
    textColor: '{colors.accent}'
    rounded: '{rounded.button}'
    padding: '11px 16px'
  field:
    backgroundColor: '{colors.surface-raised}'
    textColor: '{colors.ink}'
    rounded: '{rounded.field}'
    padding: '11px 12px'
  panel:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.radius}'
    padding: '20px'
  tag:
    backgroundColor: '{colors.surface-raised}'
    textColor: '{colors.muted}'
    rounded: '{rounded.tag}'
    padding: '6px 9px'
  navigation:
    backgroundColor: '{colors.sidebar}'
    rounded: '{rounded.button}'
    padding: '13px 14px'
  calendar-trained:
    backgroundColor: '{colors.calendar-trained-bg}'
    textColor: '{colors.calendar-trained-ink}'
    rounded: '{rounded.calendar-day}'
  switch:
    backgroundColor: '{colors.surface-raised}'
    width: '44px'
    height: '25px'
  legend:
    textColor: '{colors.muted}'
---

# Design System: FitAnalytics AI

## Overview

**Creative North Star: "Negro carbón, superficies acero y blanco"**

FitAnalytics AI utiliza la paleta aprobada de hierro de gimnasio: carbón, acero y blanco. La interfaz es limpia y compacta; el contraste, la tipografía y el espacio separan contenido y controles. Los gráficos conservan prioridad visual en el trabajo cotidiano, con recorridos propios para cuentas personales y administrativas.

La claridad de Helias, el movimiento selectivo de Lando sin introducción y el relato institucional de Grab&Go orientan la implementación. Barlow sostiene el panel; Barlow Condensed aporta presencia en el acceso y en Sobre. La fotografía de pesas es de ambientación, en escala de grises; la historia de PowerGym Lima conserva su identificación como caso ficticio.

**Key Characteristics:**

- Paleta neutral con estados semánticos diferenciados.
- Dos temas en el panel y formulario de acceso siempre claro.
- Superficies planas, encabezado sticky y navegación por rol.
- Movimientos breves, selectivos y desactivables.

## Colors

La paleta neutral cambia de luminosidad entre temas; los colores funcionales mantienen su significado. Los valores normativos están en el frontmatter y proceden de `src/styles.css`.

### Primary

`primary` y `on-primary` forman el par de acción principal; `primary-hover` indica respuesta al puntero. En el tema claro se utilizan sus equivalentes `light-*`. `accent` marca foco, enlaces y referencias; no introduce un acento cromático adicional.

### Neutral

`bg` es el fondo, `surface` contiene paneles y encabezados, y `surface-raised` diferencia campos y controles secundarios. `ink` corresponde al texto principal; `muted`, a texto de apoyo. `line` delimita superficies y `soft` responde a estados suaves. `sidebar` conserva el carbón en ambos temas.

Los tokens `light-*` corresponden a las sustituciones del tema claro. El formulario de acceso utiliza esos pares claros independientemente del tema del panel; su superficie elevada específica está recogida en `auth-surface-raised`.

`chart-actual` identifica la observación y `chart-projection` la proyección disponible. Las leyendas combinan color con trazo continuo, discontinuo y punteado; la meta utiliza el color de texto secundario.

### Estados semánticos

`danger` y `danger-bg` presentan errores; `success` y `success-bg`, confirmaciones. Los pares claros mantienen el mismo significado. Los tokens `calendar-trained-*` señalan días con entrenamiento y tienen sus equivalentes claros. Este verde es funcional, no una ampliación de la identidad de marca.

## Typography

**Display Font:** Barlow Condensed con respaldo sans-serif.
**Body Font:** Barlow con respaldo system-ui y sans-serif.

Las fuentes están alojadas localmente en WOFF2 con `font-display: swap` y síntesis desactivada. Barlow dispone de pesos (400, 500, 600 y 700); Barlow Condensed, de (500, 600 y 700). Los números de tablas, métricas y calendario son tabulares. Los encabezados equilibran sus líneas.

### Hierarchy

- **Display:** el rol del frontmatter corresponde al titular de acceso. En móvil cambia a (54px) y elimina el límite de anchura para conservar el corte explícito de dos líneas. En escritorio de poca altura utiliza (72px).
- **Headline:** títulos de página del panel; el análisis móvil usa (28px). El estilo base de otros h1 conserva `clamp(25px, 2.5vw, 34px)`.
- **Title:** encabezados de panel. Los h3 emplean (16px) con interlineado (1.5). El formulario de acceso utiliza un h2 de (28px) y espaciado de letras (-0.8px).
- **Body:** texto de apoyo del panel. En el relato institucional sube a (16px), con interlineados entre (1.6 y 1.7); el texto inicial tiene un ancho máximo de (46ch).
- **Label:** etiquetas de campo. En el acceso suben a (13px); botones y navegación utilizan (13px), mientras las etiquetas compactas utilizan (11px).

En Sobre, el título principal usa Barlow Condensed, peso (600), `clamp(48px, 5vw, 72px)`, interlineado (1) y ancho máximo (12ch). Los títulos de sección usan `clamp(32px, 3vw, 44px)` e interlineado (1.15). Estas variantes pertenecen a esas superficies, no sustituyen la jerarquía del panel.

## Layout

El panel utiliza una barra lateral fija de (236px), reducible a (80px), junto al contenido flexible. El contenido tiene un ancho máximo de (1380px) y relleno habitual de (22px 26px). La barra superior es sticky, con altura mínima de (70px), reducida a (64px) en móvil. Los elementos enfocables y encabezados del contenido conservan un margen de desplazamiento superior de (90px).

Hasta (800px), la navegación pasa a un cajón de `min(280px, calc(100vw - 48px))` y el contenido ocupa todo el ancho. Hasta (480px), el relleno de página es (22px 14px). El ancho mínimo del documento es (320px). Los formularios pasan de dos columnas a una y las tablas de historial y administración adoptan filas apiladas hasta (650px), conservando sus etiquetas y semántica.

Los gráficos del resumen forman una columna y, desde (1200px), dos columnas con proporción (1.25:1); las métricas conservan cuatro columnas en ese ancho. En análisis, las gráficas secundarias utilizan proporción (1.15:1) y se apilan hasta (650px). Los controles del análisis se reorganizan hasta (1100px). El ritmo reutiliza los pasos del frontmatter; no presupone una cuadrícula de espaciado uniforme.

El acceso dispone de dos columnas de proporción (1.05:1) y formulario de ancho máximo (390px); se apila hasta (800px). Sobre utiliza un contenedor de ancho máximo (1240px), secciones abiertas e imagen en escala de grises. Su composición también se apila hasta (800px). Estas decisiones no obligan a otras pantallas a dividir el primer viewport.

## Elevation & Depth

La profundidad cotidiana se expresa mediante superficies tonales y bordes finos (1px). Paneles, botones principales y navegación activa no llevan sombra. Las sombras se reservan para superposiciones: menú de cuenta (`0 10px 35px #0005`) y diálogo (`0 25px 100px #0006`). El fondo del diálogo atenúa la vista (`#080808aa`) con desenfoque (5px). El indicador inferior del día seleccionado es un estado funcional, no una elevación decorativa.

## Shapes

Los radios del frontmatter describen cada control y contenedor; el token `radius` corresponde a los paneles. Las formas son compactas y suavemente redondeadas. El diálogo utiliza una curvatura mayor, la fotografía de Sobre apenas redondea las esquinas (2px) y las barras de gráfico redondean solo el extremo superior. El interruptor utiliza una pista de radio (20px) y un indicador circular. Mantener bordes contenidos y evitar formas ornamentales que compitan con los datos.

## Components

### Buttons

Acciones compactas y claras. El primario utiliza el par principal; el secundario, una superficie elevada con borde; el ghost, fondo transparente y texto de acento. Comparten altura mínima (44px), tipografía (13px, peso 700) y los radios y rellenos del frontmatter. Hover cambia fondo o borde sin desplazar el botón; la pulsación reduce su escala a (0.97). El estado deshabilitado conserva opacidad (0.55) y cursor no disponible. El estado ocupado utiliza indicador y `aria-busy`.

### Chips

Las etiquetas compactas utilizan superficie elevada y texto secundario, sin borde en la cascada final. No son controles de filtrado; la variante inactiva reduce su opacidad a (0.8).

### Cards / Containers

Los paneles son planos, con borde y relleno normativos. En pantallas pequeñas su relleno baja a (18px); los paneles de gráficos del resumen también utilizan ese relleno. El relato institucional presenta secciones abiertas y una superficie de principios, sin anidar tarjetas decorativas.

### Inputs / Fields

Campos nativos con etiqueta visible, superficie elevada y altura mínima (44px). Las ayudas se asocian mediante `aria-describedby`; los errores añaden texto de peligro y `aria-invalid`. Mantener los tipos e indicaciones de teclado apropiados. El foco global utiliza contorno de acento (3px) y separación (4px).

### Navigation

Barra lateral de carbón estable entre temas; enlaces en gris claro, hover más claro y estado activo con fondo claro y texto oscuro. Los iconos son SVG de trazo. Los recorridos personal y administrativo conservan sus entradas por rol. Al colapsar, las etiquetas permanecen disponibles para accesibilidad. El enlace de Sobre y el menú de cuenta mantienen su jerarquía secundaria. El encabezado superior y el público son sticky.

### Calendario y gráficos

El verde identifica días con entrenamiento, acompañado de leyenda y estados accesibles. Hoy utiliza contorno de acento; la selección, una línea interior inferior; los días fuera de mes se atenúan. Son estados distintos y pueden coincidir. Los botones de día tienen altura mínima (34px), una excepción deliberada a las acciones principales.

Las leyendas distinguen historial con trazo continuo, proyección con discontinuo y meta con punteado. Las tablas y resúmenes textuales acompañan la lectura de datos; los estados sin datos mantienen una explicación. No reemplazar una serie ausente por datos fabricados.

### Preferencias y movimiento

El interruptor mantiene estado nativo y `role="switch"`. Los cambios de vista duran (240ms), con desplazamiento de entrada (8px); la vista saliente dura (100ms). El menú de cuenta entra en (180ms). Botones y flechas responden en (140–160ms); el cajón, en (240ms). Las curvas y duraciones exactas se registran en el sidecar.

No hay introducción animada. La animación de barras pertenece a la demostración de preferencias y no impone movimiento continuo al panel. Tanto `prefers-reduced-motion` como la preferencia de la aplicación desactivan animaciones y transiciones. La navegación por teclado suprime además la entrada de vistas y del menú de cuenta.

## Do's and Don'ts

### Do:

- Do conservar los pares de fondo y texto de cada tema, también en gráficos y estados.
- Do mantener el encabezado sticky y el margen de desplazamiento para que el foco siga visible.
- Do mantener foco visible, etiquetas asociadas, estados textuales y controles de teclado.
- Do reservar el verde del calendario para días con entrenamiento y distinguir hoy de la selección.
- Do respetar la preferencia de movimiento reducido del sistema y de la aplicación.
- Do conservar la identificación del modo demo, la historia ficticia y la fotografía de ambientación.

### Don't:

- Don't añadir una introducción bloqueante, desplazamiento forzado, cursores especiales ni fondos animados.
- Don't usar el verde semántico como acento general de la marca.
- Don't convertir la composición dividida del acceso en una obligación para las pantallas del panel.
- Don't introducir paneles dentro de paneles en el relato institucional.
- Don't ocultar estados, series o errores mediante el color como única señal.
- Don't atribuir al diseño resultados empresariales, IA generativa ni capacidades pendientes de integración en el backend.
