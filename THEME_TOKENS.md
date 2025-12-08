# 🔥 PirulinoColorete - Sistema de Tokens Nivel DIOS

## Resumen del Sistema de Temas

Este plugin de Figma genera **más de 100 tokens semánticos** organizados en 7 categorías principales, proporcionando cobertura completa para cualquier sistema de diseño profesional.

---

## 📊 Categorías de Tokens (100+ tokens)

### 1. **Foundation Tokens** (27 tokens)
Tokens fundamentales para la estructura base de la UI.

#### Background (6 tokens)
- `Background/primary` - Fondo principal de la aplicación
- `Background/secondary` - Fondo secundario (secciones alternadas)
- `Background/tertiary` - Fondo terciario (elementos anidados)
- `Background/inverse` - Fondo invertido (dark en light mode, light en dark mode)
- `Background/brand` - Fondo con color de marca sutil
- `Background/accent` - Fondo con acento más pronunciado

#### Text (8 tokens)
- `Text/primary` - Texto principal (máximo contraste)
- `Text/secondary` - Texto secundario (contraste medio)
- `Text/tertiary` - Texto terciario (contraste bajo)
- `Text/disabled` - Texto deshabilitado
- `Text/inverse` - Texto sobre fondos oscuros/claros
- `Text/brand` - Texto con color de marca
- `Text/link` - Enlaces
- `Text/linkHover` - Enlaces en hover

#### Surface (8 tokens)
Sistema de elevación con 8 niveles para crear jerarquía visual.
- `Surface/level0` - Nivel base (sin elevación)
- `Surface/level1` - Elevación mínima (cards básicos)
- `Surface/level2` - Elevación baja (cards hover)
- `Surface/level3` - Elevación media (dropdowns)
- `Surface/level4` - Elevación alta (modals)
- `Surface/overlay` - Overlays generales
- `Surface/modal` - Modales específicos
- `Surface/tooltip` - Tooltips (invertidos)

#### Border (6 tokens)
- `Border/default` - Borde estándar
- `Border/subtle` - Borde sutil (divisores)
- `Border/strong` - Borde fuerte (énfasis)
- `Border/brand` - Borde con color de marca
- `Border/focus` - Borde de foco (accesibilidad)
- `Border/error` - Borde de error

---

### 2. **Interactive Tokens** (15 tokens)
Estados completos para todos los elementos interactivos.

#### Primary Actions (6 tokens)
- `Action/primary` - Estado normal
- `Action/primaryHover` - Estado hover
- `Action/primaryActive` - Estado activo/pressed
- `Action/primaryDisabled` - Estado deshabilitado
- `Action/primarySubtle` - Variante sutil (ghost con tinte)
- `Action/primarySubtleHover` - Hover de variante sutil

#### Secondary Actions (3 tokens)
- `Action/secondary` - Estado normal
- `Action/secondaryHover` - Estado hover
- `Action/secondaryActive` - Estado activo

#### Ghost/Tertiary Actions (3 tokens)
- `Action/ghost` - Botones transparentes
- `Action/ghostHover` - Hover
- `Action/ghostActive` - Activo

#### Destructive Actions (3 tokens)
- `Action/destructive` - Acciones peligrosas
- `Action/destructiveHover` - Hover
- `Action/destructiveActive` - Activo

---

### 3. **Component-Specific Tokens** (27 tokens)
Tokens dedicados para componentes específicos.

#### Input Fields (10 tokens)
- `Input/background` - Fondo normal
- `Input/backgroundHover` - Fondo hover
- `Input/backgroundFocus` - Fondo focus
- `Input/backgroundDisabled` - Fondo deshabilitado
- `Input/border` - Borde normal
- `Input/borderHover` - Borde hover
- `Input/borderFocus` - Borde focus (accesibilidad)
- `Input/borderError` - Borde error
- `Input/placeholder` - Texto placeholder
- `Input/text` - Texto ingresado

#### Cards (4 tokens)
- `Card/background` - Fondo normal
- `Card/backgroundHover` - Fondo hover
- `Card/border` - Borde normal
- `Card/borderHover` - Borde hover

#### Buttons (3 tokens)
- `Button/primaryText` - Texto sobre botón primary
- `Button/secondaryText` - Texto sobre botón secondary
- `Button/ghostText` - Texto sobre botón ghost

#### Badges & Tags (4 tokens)
- `Badge/background` - Fondo neutral
- `Badge/text` - Texto neutral
- `Badge/brandBackground` - Fondo con marca
- `Badge/brandText` - Texto con marca

#### Navigation (5 tokens)
- `Nav/background` - Fondo de navegación
- `Nav/itemDefault` - Item normal
- `Nav/itemHover` - Item hover
- `Nav/itemActive` - Item activo
- `Nav/itemActiveBackground` - Fondo de item activo

---

### 4. **Status & Feedback Tokens** (16 tokens)
Sistema completo de feedback visual.

#### Success (4 tokens)
- `Status/success` - Color principal
- `Status/successSubtle` - Fondo sutil
- `Status/successBorder` - Borde
- `Status/successText` - Texto

#### Warning (4 tokens)
- `Status/warning` - Color principal
- `Status/warningSubtle` - Fondo sutil
- `Status/warningBorder` - Borde
- `Status/warningText` - Texto

#### Error (4 tokens)
- `Status/error` - Color principal
- `Status/errorSubtle` - Fondo sutil
- `Status/errorBorder` - Borde
- `Status/errorText` - Texto

#### Info (4 tokens)
- `Status/info` - Color principal
- `Status/infoSubtle` - Fondo sutil
- `Status/infoBorder` - Borde
- `Status/infoText` - Texto

---

### 5. **Overlay & Scrim Tokens** (4 tokens)
Para modales, loading states y overlays.

- `Overlay/backdrop` - Fondo de modales (semi-transparente)
- `Overlay/scrim` - Scrim oscuro (bloqueo de UI)
- `Overlay/skeleton` - Loading skeletons
- `Overlay/loading` - Indicadores de carga

---

### 6. **Icon Tokens** (5 tokens)
Colores específicos para iconografía.

- `Icon/default` - Iconos normales
- `Icon/subtle` - Iconos sutiles
- `Icon/disabled` - Iconos deshabilitados
- `Icon/brand` - Iconos con color de marca
- `Icon/inverse` - Iconos sobre fondos oscuros/claros

---

### 7. **Accessibility Tokens** (4 tokens)
Tokens dedicados a accesibilidad (WCAG AA/AAA).

- `A11y/focusRing` - Anillo de foco (teclado)
- `A11y/focusRingError` - Anillo de foco en error
- `A11y/highContrastText` - Texto alto contraste
- `A11y/highContrastBorder` - Borde alto contraste

---

## 🎨 Características del Sistema

### ✅ Cobertura Completa
- **100+ tokens** vs 15 tokens básicos anteriores
- Todos los estados interactivos (normal, hover, active, disabled, focus)
- Componentes específicos (inputs, cards, buttons, badges, nav)
- Sistema de elevación completo (8 niveles)
- Feedback visual completo (success, warning, error, info)

### ✅ Accesibilidad First
- Tokens dedicados de accesibilidad
- Focus rings para navegación por teclado
- Alto contraste para WCAG AAA
- Bordes de error específicos

### ✅ Modos Light/Dark
- Cada token tiene valores optimizados para ambos modos
- Transiciones suaves entre modos
- Contraste garantizado en ambos temas

### ✅ Escalabilidad
- Organización jerárquica clara
- Naming convention consistente
- Fácil de extender con nuevos tokens

---

## 📖 Guía de Uso

### Generar un Tema

1. **Tab 1: Colors** - Genera tus paletas de color (50-950)
2. **Tab 5: Theme** - Selecciona:
   - Accent Palette (para acciones/marca)
   - Neutral Palette (para backgrounds/texto)
   - Status Palettes (success, warning, error)
3. **Generate Theme** - Crea automáticamente los 100+ tokens
4. **Preview & Refine** - Ajusta tokens específicos si es necesario
5. **Create Theme** - Genera la colección en Figma

### Aplicar Tokens en Diseño

Los tokens están organizados por caso de uso:

```
// Ejemplo: Botón Primary
Background: Action/primary
Text: Button/primaryText
Hover: Action/primaryHover
Active: Action/primaryActive
Disabled: Action/primaryDisabled
Focus Ring: A11y/focusRing
```

```
// Ejemplo: Input Field
Background: Input/background
Border: Input/border
Text: Input/text
Placeholder: Input/placeholder
Focus Border: Input/borderFocus
Error Border: Input/borderError
```

---

## 🚀 Ventajas vs Sistema Básico

| Aspecto | Sistema Básico | Sistema GOD-TIER |
|---------|----------------|------------------|
| **Tokens Totales** | 15 | 100+ |
| **Estados Interactivos** | Parcial | Completo |
| **Componentes Específicos** | No | Sí (6 categorías) |
| **Accesibilidad** | Básico | Dedicado (4 tokens) |
| **Elevación** | 3 niveles | 8 niveles |
| **Status/Feedback** | 6 tokens | 16 tokens |
| **Overlays** | 1 token | 4 tokens |
| **Iconografía** | No | 5 tokens |

---

## 💡 Casos de Uso

### Dashboard Empresarial
- Usa `Surface/level0-4` para crear jerarquía visual
- `Nav/*` para navegación lateral
- `Card/*` para widgets de datos
- `Status/*` para KPIs y alertas

### E-commerce
- `Action/primary` para CTAs (Add to Cart, Checkout)
- `Badge/*` para etiquetas de producto
- `Status/success` para confirmaciones
- `Input/*` para formularios de checkout

### SaaS Application
- `A11y/*` para cumplir WCAG
- `Input/*` para formularios complejos
- `Overlay/*` para modales y loading states
- `Icon/*` para UI consistente

---

## 🎯 Próximas Mejoras

- [ ] Tokens de animación/timing
- [ ] Tokens de spacing responsive
- [ ] Tokens de tipografía semántica
- [ ] Tokens de sombras (elevation shadows)
- [ ] Export a CSS/SCSS/Tailwind
- [ ] Temas predefinidos (Material, iOS, Fluent)

---

**Creado con 🔥 por PirulinoColorete**
