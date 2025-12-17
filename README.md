# 🎨 PirulinoColorete

**Plugin de Figma para generar sistemas de diseño completos con tokens de variables**

Un plugin profesional que automatiza la creación de un Design System completo en Figma, desde paletas de colores hasta tokens semánticos responsivos, con exportación a múltiples formatos.

---

## ✨ Características Principales

### 🎨 **1. Colors - Generador de Paletas**
Crea paletas de colores profesionales con algoritmo OKLCH para colores perceptualmente uniformes.

- **Escala de 11 tonos** (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950) estilo Tailwind
- **Entrada flexible**: HEX, RGB, HSL, OKLCH
- **Preview en tiempo real** con información de contraste WCAG
- **Batch generation**: Genera múltiples paletas de una vez
- **Presets incluidos**: Tailwind, Material, Radix
- **Organización por colección y grupo**

### 📏 **2. Measures - Sistema de Medidas**
Define escalas de espaciado consistentes para tu sistema de diseño.

- **Valores personalizables** o usa presets (Default, Tailwind, Bootstrap, Material)
- **Preview visual** de la escala
- **Variables en px** para spacing, padding, margin, gap, radius
- **Barra de progreso** durante la creación

### 🔤 **3. Typography - Sistema Tipográfico**
Configura todas las variables tipográficas de tu sistema.

- **Font Families**: Heading, Body, Code/Mono
- **Font Weights**: Escala completa 100-900 con nombres semánticos (Thin, Light, Regular, Bold, etc.)
- **Font Sizes**: Escala con nombres T-shirt (3xs a 7xl)
- **Letter Spacing**: Escala semántica (ultra-tight a ultra-wide) con valores en porcentaje convertidos automáticamente

### 🔗 **4. Aliases - Tokens Responsivos**
Crea tokens semánticos que se adaptan automáticamente a diferentes breakpoints.

- **3 modos responsivos**: Desktop, Tablet, Mobile
- **Typography semántica**: Headings (H1-H6), Body, Caption, Label
- **Letter Spacing responsivo**: tighter, tight, normal, wide, wider
- **Border Width responsivo**: none, hairline, thin, medium, thick, heavy
- **Radius aliases**: none, 2xs, xs, sm, md, lg, xl, 2xl, 3xl, full
- **Referencias a primitivos**: Los tokens son alias de tus variables base

### 🌓 **5. Theme - Sistema de Temas**
Genera un sistema completo de tokens de color con modos Light y Dark.

- **100+ tokens semánticos** organizados en categorías
- **Preview interactivo** del tema
- **Editor de tokens** para ajustar colores individuales
- **Selección de paletas**: Accent, Neutral, Status (Success, Warning, Error)

#### Categorías de Tokens del Tema:

| Categoría | Tokens | Incluye |
|-----------|--------|---------|
| **Background** | 6 | base, subtle, muted, inverse, elevated, sunken |
| **Text** | 8 | primary, secondary, tertiary, muted, inverse, link, linkHover, disabled |
| **Surface** | 8 | level0-4, card, overlay, highlight |
| **Border** | 6 | subtle, default, strong, focus, divider, decorative |
| **Action** | 15 | primary, secondary, ghost, destructive (+ hover/active/disabled) |
| **Status** | 16 | success, warning, error, info (bg, text, border, subtle) |
| **Components** | 27 | Input, Card, Button, Badge, Nav |
| **A11y** | 4 | Focus rings, High contrast |

### 📚 **6. Collections - Gestión de Colecciones**
Administra y organiza todas tus colecciones de variables.

- **Vista de colecciones** existentes
- **Información de variables** por colección

### 🛠️ **7. Dev Tools - Exportación**
Exporta todas tus variables en múltiples formatos para desarrollo.

#### Formatos de Exportación:
- **JSON**: Design Tokens estándar
- **CSS**: Custom Properties con selectores por modo
- **SCSS**: Variables y mapas para multi-modo
- **Tailwind**: Configuración para theme.extend
- **TypeScript**: Constantes tipadas

#### Opciones de Exportación:
- **Filtros**: Por colección y/o grupo
- **Naming Conventions**: kebab-case, camelCase, snake_case, Original
- **Color Formats**: HEX, RGBA, HSL, OKLCH, Display-P3
- **Include Modes**: Exportar todos los modos o solo el default
- **Resolve References**: Expandir aliases a valores finales
- **Include Metadata**: Agregar tipo y descripción

#### Acciones:
- **Copy to Clipboard**: Copia el output con un click
- **Download**: Descarga como archivo (.json, .css, .scss, .js, .ts)

---

## 🚀 Instalación

### Desde GitHub (Desarrollo Local)
1. Clona este repositorio
2. Abre Figma → Plugins → Development → Import plugin from manifest
3. Selecciona el archivo `manifest.json`
4. El plugin aparecerá en Plugins → Development → PirulinoColorete

### Build
```bash
# Instalar dependencias
npm install

# Build del código TypeScript
npm run build:code

# Build de la UI
npm run build:ui

# Build completo
npm run build
```

---

## 📋 Workflow Recomendado

```
1. 🎨 Colors
   └── Genera tus paletas base (Accent, Neutral, Status colors)
   
2. � Measures
   └── Define tu escala de spacing (0, 0.5, 1, 2, 4, 8, 12, 16, 24, 32...)
   
3. 🔤 Typography
   └── Configura fonts, weights, sizes, letter-spacing
   
4. � Aliases
   └── Crea tokens responsivos que referencian tus primitivos
   
5. 🌓 Theme
   └── Genera tokens semánticos con Light/Dark modes
   
6. 🛠️ Dev Tools
   └── Exporta todo a CSS, SCSS, Tailwind o TypeScript
```

---

## 🛠️ Tecnologías

- **TypeScript**: Código del plugin tipado
- **OKLCH Color Space**: Colores perceptualmente uniformes
- **Figma Variables API**: Sistema nativo de variables
- **Figma Variable Modes**: Light/Dark y responsivo
- **esbuild**: Bundling rápido
- **WCAG 2.1**: Cálculos de contraste para accesibilidad

---

## � Estructura del Proyecto

```
PirulinoColorete/
├── src/
│   ├── code/
│   │   └── main.ts         # Lógica principal del plugin
│   └── ui/
│       ├── sections/       # HTML de cada sección
│       └── styles/         # CSS modular
├── scripts/                # JavaScript de la UI
├── manifest.json           # Configuración del plugin
├── code.js                 # Build del código
├── ui.html                 # Build de la UI
└── build.js                # Script de build de UI
```

---

## 📊 Ejemplo de Output

### CSS Export
```css
:root {
  --color-teal-50: #f0fdfa;
  --color-teal-500: #14b8a6;
  --color-teal-950: #042f2e;
  --typography-font-size-base: 16px;
  --measure-8px: 8px;
}

[data-theme="dark"] {
  --color-teal-50: #042f2e;
  --color-teal-500: #2dd4bf;
}
```

### JSON Export
```json
{
  "color-teal-50": "#f0fdfa",
  "color-teal-500": "#14b8a6",
  "typography-font-size-base": 16,
  "measure-8px": 8
}
```

### Tailwind Config
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        "color-teal-50": "#f0fdfa",
        "color-teal-500": "#14b8a6"
      }
    }
  }
}
```

---

## ✅ Roadmap

- [x] Generador de paletas de color (OKLCH)
- [x] Sistema de medidas con presets
- [x] Sistema de tipografía completo
- [x] Tokens responsivos (Desktop/Tablet/Mobile)
- [x] Sistema de temas Light/Dark (100+ tokens)
- [x] Exportación multi-formato (JSON, CSS, SCSS, Tailwind, TS)
- [x] Múltiples formatos de color (HEX, RGBA, HSL, OKLCH, P3)
- [ ] Documentación Figma (generación automática)
- [ ] Temas predefinidos (Material, iOS, Fluent)
- [ ] Tokens de animación
- [ ] Tokens de sombras
- [ ] Sync con repositorio externo

---

## 📄 Licencia

GNU General Public License v3.0

---

## 🤝 Contribuir

¿Ideas para mejorar el plugin? ¡Abre un issue o PR!

---

## 💬 Autor

Creado por **Pablo D.**

---

⭐ Si te resulta útil este proyecto, dale una estrella!
