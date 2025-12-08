# 🎨 PirulinoColorete

**Plugin de Figma para generar sistemas de diseño completos con tokens nivel DIOS** 🔥

---

## ✨ Características Principales

### 🎨 **1. Generador de Paletas de Color**
- Genera escalas de 11 tonos (50-950) estilo Tailwind
- Algoritmo OKLCH para colores perceptualmente uniformes
- Preview en tiempo real
- Batch generation (múltiples paletas a la vez)

### 📏 **2. Sistema de Medidas**
- Escalas de spacing personalizables
- Valores en px para padding, margin, gap, radius
- Organización por grupos

### 🔤 **3. Sistema de Tipografía**
- Font families (Heading, Body, Code)
- Font weights (100-950)
- Font sizes con nombres semánticos (xs, sm, base, lg, xl, 2xl...)
- Letter spacing

### 🔗 **4. Tokens Responsivos (Aliases)**
- Sistema de 3 modos (Desktop, Tablet, Mobile)
- Tokens semánticos que se adaptan automáticamente
- Typography responsive (H1, Body, Caption...)
- Spacing responsive (Gap, Padding, Radius)

### 🌓 **5. Sistema de Temas (GOD-TIER)** 🔥
**¡NUEVO! Más de 100 tokens organizados en 7 categorías:**

#### 📊 Desglose de Tokens

| Categoría | Tokens | Descripción |
|-----------|--------|-------------|
| **Foundation** | 27 | Background (6) • Text (8) • Surface (8) • Border (6) |
| **Interactive** | 15 | Primary (6) • Secondary (3) • Ghost (3) • Destructive (3) |
| **Components** | 27 | Input (10) • Card (4) • Button (3) • Badge (4) • Nav (5) |
| **Status & Feedback** | 16 | Success (4) • Warning (4) • Error (4) • Info (4) |
| **Overlays** | 4 | Backdrop • Scrim • Skeleton • Loading |
| **Icons** | 5 | Default • Subtle • Disabled • Brand • Inverse |
| **Accessibility** | 4 | Focus Rings • High Contrast |
| **TOTAL** | **100+** | Cobertura completa para cualquier UI |

---

## 🚀 Cómo Usar

### Instalación
1. Descarga el plugin desde Figma Community (próximamente) o instala localmente
2. Abre Figma → Plugins → Development → Import plugin from manifest
3. Selecciona el archivo `manifest.json`

### Workflow Recomendado

```
1. Colors (Tab 1)
   ↓
   Genera tus paletas base (Accent, Neutral, Status)
   
2. Measures (Tab 2)
   ↓
   Define tu escala de spacing
   
3. Typography (Tab 3)
   ↓
   Configura fonts, weights, sizes
   
4. Aliases (Tab 4)
   ↓
   Crea tokens responsivos (Desktop/Tablet/Mobile)
   
5. Theme (Tab 5) 🔥
   ↓
   Genera 100+ tokens semánticos con Light/Dark modes
```

---

## 🔥 Sistema de Temas: De Básico a GOD-TIER

### Antes (Sistema Básico)
```
✗ 15 tokens genéricos
✗ Estados incompletos
✗ Sin componentes específicos
✗ Accesibilidad limitada
```

### Ahora (Sistema GOD-TIER)
```
✓ 100+ tokens organizados
✓ Estados completos (normal, hover, active, disabled, focus)
✓ Componentes específicos (Input, Card, Button, Badge, Nav)
✓ Sistema de elevación (8 niveles)
✓ Feedback completo (Success, Warning, Error, Info)
✓ Accesibilidad dedicada (Focus rings, High contrast)
✓ Overlays y loading states
✓ Iconografía consistente
```

### Ejemplo de Uso

**Antes:**
```
Button Primary:
- Background: Action/primary ❌ (solo 1 estado)
```

**Ahora:**
```
Button Primary:
- Background: Action/primary
- Hover: Action/primaryHover
- Active: Action/primaryActive
- Disabled: Action/primaryDisabled
- Text: Button/primaryText
- Focus Ring: A11y/focusRing
✓ 6 tokens para un solo componente
```

---

## 📖 Documentación Completa

Ver [THEME_TOKENS.md](./THEME_TOKENS.md) para:
- Lista completa de los 100+ tokens
- Guías de uso por componente
- Casos de uso (Dashboard, E-commerce, SaaS)
- Comparación detallada vs sistema básico

---

## 🎯 Casos de Uso

### 🏢 Dashboard Empresarial
- **Foundation**: `Surface/level0-4` para jerarquía visual
- **Components**: `Nav/*` para navegación lateral, `Card/*` para widgets
- **Status**: Indicadores de KPIs con `Status/success`, `Status/warning`, `Status/error`

### 🛒 E-commerce
- **Interactive**: `Action/primary` para CTAs (Add to Cart, Checkout)
- **Components**: `Badge/*` para etiquetas de producto, `Input/*` para checkout
- **Status**: Confirmaciones con `Status/success`

### 💼 SaaS Application
- **Accessibility**: `A11y/*` para cumplir WCAG AA/AAA
- **Components**: `Input/*` para formularios complejos
- **Overlays**: `Overlay/*` para modales y loading states

---

## 🛠️ Tecnologías

- **Color Science**: OKLCH para colores perceptualmente uniformes
- **Algoritmo**: Curvas de luminosidad y chroma basadas en Tailwind CSS
- **Accesibilidad**: Cálculos de contraste WCAG 2.1
- **Variables**: Sistema nativo de Figma Variables
- **Modos**: Light/Dark automático con Variable Modes

---

## 📊 Comparación de Características

| Característica | Básico | GOD-TIER |
|----------------|--------|----------|
| Tokens de Color | 15 | 100+ |
| Estados Interactivos | Parcial | Completo |
| Componentes Específicos | ❌ | ✅ (6 categorías) |
| Sistema de Elevación | 3 niveles | 8 niveles |
| Status/Feedback | 6 tokens | 16 tokens |
| Accesibilidad | Básico | Dedicado (4 tokens) |
| Overlays | 1 token | 4 tokens |
| Iconografía | ❌ | ✅ (5 tokens) |
| Responsive | ❌ | ✅ (3 modos) |
| Documentación | ❌ | ✅ (Completa) |

---

## 🎨 Preview

### Generador de Paletas
![Color Generator](https://via.placeholder.com/800x400?text=Color+Generator+Preview)

### Sistema de Temas
![Theme System](https://via.placeholder.com/800x400?text=Theme+System+Preview)

### Token Organization
![Token Organization](https://via.placeholder.com/800x400?text=100%2B+Tokens+Organized)

---

## 🚧 Roadmap

- [x] Generador de paletas de color
- [x] Sistema de medidas
- [x] Sistema de tipografía
- [x] Tokens responsivos
- [x] Sistema de temas GOD-TIER (100+ tokens)
- [ ] Export a CSS/SCSS/Tailwind
- [ ] Temas predefinidos (Material, iOS, Fluent)
- [ ] Tokens de animación
- [ ] Tokens de sombras (elevation shadows)
- [ ] Generación de componentes automática

---

## 📄 Licencia

GNU General Public License v3.0

---

## 🤝 Contribuir

¿Ideas para mejorar el sistema de tokens? ¡Abre un issue o PR!

---

## 💬 Contacto

Creado con 🔥 por **PirulinoColorete**

---

## ⭐ Si te gusta este proyecto

Dale una estrella ⭐ y compártelo con tu equipo de diseño!

**De 15 tokens básicos a 100+ tokens nivel DIOS** 🚀
