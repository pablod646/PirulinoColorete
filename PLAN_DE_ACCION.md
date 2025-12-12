# 📋 Plan de Acción: Implementación de Mejoras para PirulinoColorete

> **Fecha de Creación:** 2025-12-12  
> **Basado en:** Análisis de `MEJORAS_RECOMENDADAS.md` + Estructura actual del proyecto + Metadata de Figma MCP

---

## 📊 Resumen Ejecutivo

Este plan detalla la implementación de mejoras para el plugin **PirulinoColorete - Design Architect**, organizado en **4 fases** con entregables específicos y estimaciones de tiempo.

### Estado Actual del Proyecto
- **Backend:** TypeScript completo (`src/code/main.ts` - 2339 líneas, ~97KB)
- **Frontend:** UI HTML con CSS y JS embebido (`ui.html` - ~195KB)
- **Estructura Modular:** `src/ui/` con componentes, secciones, estilos y utils
- **Figma Integration:** Colecciones de paletas (Yellow, Green, Blue, Slate, etc.)

---

## 🎨 ANÁLISIS DEL SISTEMA DE DISEÑO EN FIGMA

### Estructura del Documento Figma

El documento de Figma contiene un frame principal llamado **"Roots"** (2880x2336px) que organiza las paletas de colores:

```
📁 Roots (Frame principal)
├── 📁 Colors/Yellow (11 Color Cards: 50-950)
├── 📁 Colors/Green (11 Color Cards: 50-950)  
├── 📁 Colors/Indigo (11 Color Cards: 50-950)
├── 📁 Colors/Pink (11 Color Cards: 50-950)
├── 📁 Colors/Red (11 Color Cards: 50-950)
└── 📁 Colors/Slate (9 Color Cards: 50-900) - Neutral
```

### Componente: Color Card v7

Componente master (`node-id: 2:1026`) con la siguiente estructura:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Name** | Nombre de la paleta + escala | `Yellow-50`, `Indigo-950` |
| **WCAG Black** | Ratio de contraste con negro | `Black: AAA (19.53)` |
| **WCAG White** | Ratio de contraste con blanco | `White: Fail (1.08)` |
| **CSS Var** | Variable CSS generada | `var(--yellow-50)` |
| **Hex** | Código hexadecimal | `#FBF6ED` |
| **RGBA** | Valor RGBA | `rgba(251, 246, 237, 1.00)` |
| **OKLCH** | Valor en espacio OKLCH | `oklch(0.975 0.013 82.5)` |
| **P3** | Display P3 color | `color(display-p3 0.982 0.966 0.933)` |
| **Lum** | Luminancia | `L: 0.927` |

### Paletas Identificadas (con Hex del valor 50)

| Paleta | Hex-50 | Hue OKLCH | Rol Sugerido |
|--------|--------|-----------|--------------|
| **Yellow** | `#FBF6ED` | 82.5° | Warning/Accent cálido |
| **Green** | `#F0FAF0` | 147.9° | Success |
| **Indigo** | `#F3F6FF` | 272.9° | Accent/Brand |
| **Pink** | `#FFF2F7` | 349.2° | Accent alternativo |
| **Red** | `#FFF2F0` | 28.0° | Error/Destructive |
| **Slate** | `#F5F7F9` | 257.4° | Neutral |

### Mapeo de Escalas → Tokens Semánticos (TOKEN_SCHEMA actual)

```typescript
// Configuración actual en main.ts líneas 921-946
const TOKEN_SCHEMA = [
  // Backgrounds (usando neutralPalette)
  { name: 'Background/primary',   light: '50',  dark: '950' },
  { name: 'Background/secondary', light: '100', dark: '800' },
  { name: 'Background/tertiary',  light: '200', dark: '700' },
  
  // Text (usando neutralPalette)
  { name: 'Text/primary',   light: '900', dark: '50'  },
  { name: 'Text/secondary', light: '700', dark: '300' },
  { name: 'Text/tertiary',  light: '600', dark: '400' },
  { name: 'Text/brand',     light: '700', dark: '300', useAccent: true },
  
  // Surfaces (usando neutralPalette)
  { name: 'Surface/card',    light: '50',  dark: '800' },
  { name: 'Surface/modal',   light: '50',  dark: '800' },
  { name: 'Surface/overlay', light: '900', dark: '950' },
  
  // Borders
  { name: 'Border/default', light: '200', dark: '700' },
  { name: 'Border/subtle',  light: '100', dark: '800' },
  { name: 'Border/focus',   light: '500', dark: '400', useAccent: true },
  { name: 'Border/error',   light: '500', dark: '400', useStatus: 'error' },
  
  // Actions (usando accentPalette)
  { name: 'Action/primary',      light: '600', dark: '500', useAccent: true },
  { name: 'Action/primaryHover', light: '700', dark: '300', useAccent: true },
  { name: 'Action/secondary',    light: '100', dark: '800' },
  { name: 'Action/destructive',  light: '600', dark: '500', useStatus: 'error' },
  
  // Status (usando statusPalettes)
  { name: 'Status/success',   light: '600', dark: '400', useStatus: 'success' },
  { name: 'Status/successBg', light: '50',  dark: '900', useStatus: 'success' },
  { name: 'Status/warning',   light: '600', dark: '400', useStatus: 'warning' },
  { name: 'Status/warningBg', light: '50',  dark: '900', useStatus: 'warning' },
  { name: 'Status/error',     light: '600', dark: '400', useStatus: 'error' },
  { name: 'Status/errorBg',   light: '50',  dark: '900', useStatus: 'error' }
];
```

### Flujo de Trabajo Actual con Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                     FIGMA DOCUMENT                               │
├─────────────────────────────────────────────────────────────────┤
│  Color Card v7 (Component Master)                               │
│  ├── Instances con valores de cada escala                       │
│  └── Datos: Name, WCAG, Hex, RGBA, OKLCH, P3, Lum               │
├─────────────────────────────────────────────────────────────────┤
│  Variables Collection (generada por plugin)                      │
│  ├── Colors/[Palette]/[Scale] → Variables de color base         │
│  └── [ThemeName]/[Token] → Variables semánticas con alias       │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│               PIRULINOCOLORETE PLUGIN                            │
├─────────────────────────────────────────────────────────────────┤
│  1. loadPalettes() → Detecta paletas por estructura de nombre   │
│  2. generateTheme() → Crea tokens según TOKEN_SCHEMA            │
│  3. createThemeCollection() → Genera Variables Collection       │
│  4. loadThemeFromCollection() → Carga tema existente            │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    THEME EDITOR UI                               │
├─────────────────────────────────────────────────────────────────┤
│  • Preview Light/Dark con tokens aplicados                       │
│  • Token rows con selectores por escala                          │
│  • Click-to-edit navigation                                      │
│  • Regeneración en tiempo real                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Detección Automática de Roles

El plugin detecta el rol de cada paleta usando heurísticas:

```typescript
// Líneas 1291-1317 de main.ts
// Neutral indicators (alto peso: +20)
'gray', 'grey', 'slate', 'zinc', 'neutral', 'stone', 'cement', 'silver'

// Accent/Brand indicators (peso medio: +15)
'brand', 'primary', 'accent', 'blue', 'indigo', 'purple', 'violet', 'teal', 'cyan'

// Status indicators (alto peso: +20)
success: 'success', 'green', 'emerald'
warning: 'warning', 'yellow', 'amber', 'orange'
error:   'error', 'red', 'danger', 'rose'
```

### Sistema Completo de Variables de Figma

El plugin genera **múltiples tipos de Variables Collections**:

#### 1. **Color Variables** (createVariables)
```typescript
// Path: [groupName]/[colorName]/[colorName]-[scale]
// Type: COLOR
// Scales: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950

// Ejemplo de estructura:
Colors/Yellow/Yellow-50   → { r: 0.984, g: 0.965, b: 0.929 }
Colors/Yellow/Yellow-500  → { r: 0.906, g: 0.729, b: 0.153 }
Colors/Yellow/Yellow-950  → { r: 0.224, g: 0.145, b: 0.000 }
```

#### 2. **Measure Variables** (createMeasureVariables)
```typescript
// Path: [groupName]/[value]px
// Type: FLOAT
// Valores típicos: 2, 4, 8, 12, 16, 20, 24, 32, 48, 64, 96...

// Ejemplo de estructura:
Measures/2px   → 2
Measures/4px   → 4
Measures/8px   → 8
Measures/16px  → 16
Measures/24px  → 24
Measures/32px  → 32
```

#### 3. **Typography Variables** (createTypographyVariables)
```typescript
// Paths generados:
// - [group]/Font Family/[Primary|Secondary|Display]
// - [group]/Font Weight/[Thin|Light|Regular|Medium|Bold|Black...]
// - [group]/Letter Spacing/[value]
// - [group]/Font Size/[3xs|2xs|xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl]
// Types: STRING (families), FLOAT (weights, spacing, sizes)

// Ejemplo de estructura:
Typography/Font Family/Primary  → "Inter"
Typography/Font Family/Display  → "Outfit"
Typography/Font Weight/Regular  → 400
Typography/Font Weight/Bold     → 700
Typography/Font Size/base       → 16
Typography/Font Size/xl         → 20
Typography/Font Size/4xl        → 36
Typography/Letter Spacing/-2    → -2
```

#### 4. **Semantic Tokens / Responsive Aliases** (createSemanticTokens)
```typescript
// Modes: Desktop, Tablet, Mobile
// Type: FLOAT (aliases a Measures o Typography)

// Typography responsive:
Typography/Caption        → xs (all modes)
Typography/Body/s         → sm (all modes)
Typography/Body/m         → base (all modes)
Typography/Heading/h4     → Desktop: 2xl, Tablet: xl, Mobile: lg
Typography/Heading/h1     → Desktop: 5xl, Tablet: 4xl, Mobile: 3xl
Typography/Display/h1     → Desktop: 7xl, Tablet: 6xl, Mobile: 5xl

// Spacing responsive:
Spacing/Gap/2xs           → Desktop: 4px, Tablet: 2px, Mobile: 2px
Spacing/Gap/m             → Desktop: 24px, Tablet: 20px, Mobile: 16px
Spacing/Gap/xl            → Desktop: 48px, Tablet: 32px, Mobile: 24px
Spacing/Padding/sm        → Desktop: 16px, Tablet: 12px, Mobile: 8px
Spacing/Padding/lg        → Desktop: 32px, Tablet: 24px, Mobile: 16px
Spacing/Radius/m          → Desktop: 8px, Tablet: 8px, Mobile: 4px
```

#### 5. **Theme Collection** (createThemeCollection)
```typescript
// Modes: Light, Dark
// Type: COLOR (aliases a Color Variables)

// Tokens semánticos de color:
Background/primary   → Light: Slate-50,  Dark: Slate-950
Background/secondary → Light: Slate-100, Dark: Slate-800
Text/primary         → Light: Slate-900, Dark: Slate-50
Text/brand           → Light: Indigo-700, Dark: Indigo-300
Action/primary       → Light: Indigo-600, Dark: Indigo-500
Status/success       → Light: Green-600, Dark: Green-400
Status/error         → Light: Red-600, Dark: Red-400
```

### Diagrama de Dependencias de Variables

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      VARIABLE HIERARCHY                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📊 PRIMITIVES (valores base, sin aliases)                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Colors/           Measures/          Typography/               │    │
│  │  ├── Yellow/50     ├── 2px           ├── Font Family/Primary   │    │
│  │  ├── Yellow/500    ├── 4px           ├── Font Weight/Bold      │    │
│  │  ├── Indigo/600    ├── 16px          ├── Font Size/xl          │    │
│  │  └── Slate/950     └── 48px          └── Letter Spacing/-2     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│           │                    │                    │                   │
│           ▼                    ▼                    ▼                   │
│  🔗 SEMANTIC TOKENS (aliases a primitivos)                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Theme Collection         Responsive Collection                 │    │
│  │  (Light/Dark modes)       (Desktop/Tablet/Mobile modes)         │    │
│  │                                                                 │    │
│  │  Background/primary       Typography/Heading/h1                 │    │
│  │    → Light: Slate-50        → Desktop: 5xl                      │    │
│  │    → Dark: Slate-950        → Tablet: 4xl                       │    │
│  │                             → Mobile: 3xl                       │    │
│  │  Action/primary                                                 │    │
│  │    → Light: Indigo-600    Spacing/Gap/xl                        │    │
│  │    → Dark: Indigo-500       → Desktop: 48px                     │    │
│  │                             → Tablet: 32px                      │    │
│  │                             → Mobile: 24px                      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│           │                                                             │
│           ▼                                                             │
│  🎨 APLICACIÓN EN DISEÑO                                                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Componentes de Figma usan variables semánticas                 │    │
│  │  → Cambian automáticamente con el modo seleccionado             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Relación Visual ↔ Variables (Color Cards)

```
┌────────────────────────────────────────────────────────────────────┐
│                    COLOR CARD V7 (Visual)                          │
│                                                                    │
│  ┌──────────────┐  Datos extraídos:                                │
│  │  Yellow-50   │  • Hex: #FBF6ED                                  │
│  │  ▓▓▓▓▓▓▓▓▓▓  │  • CSS Var: var(--yellow-50)                     │
│  │  Black: AAA  │  • OKLCH: oklch(0.975 0.013 82.5)                │
│  │  #FBF6ED     │  • WCAG: Black AAA, White Fail                   │
│  └──────────────┘                                                  │
│         │                                                          │
│         ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │           FIGMA VARIABLE (Generada por plugin)              │   │
│  │                                                             │   │
│  │  Name: Colors/Yellow/Yellow-50                              │   │
│  │  Type: COLOR                                                │   │
│  │  Value: { r: 0.984, g: 0.965, b: 0.929 }                    │   │
│  │  Collection: Root Colors                                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│         │                                                          │
│         ▼  (usado como alias)                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │         THEME VARIABLE (Token semántico)                    │   │
│  │                                                             │   │
│  │  Name: Status/warningBg                                     │   │
│  │  Light Mode: alias → Colors/Yellow/Yellow-50                │   │
│  │  Dark Mode: alias → Colors/Yellow/Yellow-900                │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

### Implicaciones para el Plan de Mejoras

#### 1. **Exportación de Temas** debe considerar:
- Generar CSS Variables con nomenclatura `--[palette]-[scale]`
- Mantener los formatos OKLCH y P3 para Wide Gamut
- Incluir validación WCAG pre-calculada

#### 2. **Nuevos Componentes** a soportar:
- Color Cards actualizados automáticamente cuando se regenera
- Theme Comparison (lado a lado)
- Accessibility Report basado en WCAG data

#### 3. **Presets** deben mapear a:
- Material Design 3: Usar escalas y surface tints
- Apple HIG: Colores vibrantes con adaptación dark mode
- Tailwind: Nomenclatura estándar 50-950

#### 4. **Validación de Contraste** ya tiene:
- Datos WCAG pre-calculados en Color Cards
- Luminancia disponible en cada card
- Ratio vs Black y White calculado

---

## 🗓️ FASE 1: FUNDAMENTOS (Semana 1)
### 🎯 Objetivo: Accesibilidad y Error Handling Robusto

---

### ✅ Tarea 1.1: Implementar Sistema de Notificaciones Toast

**Descripción:** Crear componente reutilizable para feedback visual al usuario.

**Archivos a crear:**
```
src/ui/utils/notifications.ts
```

**Implementación:**
```typescript
// src/ui/utils/notifications.ts
interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export function createToast(options: ToastOptions): HTMLElement {
  const toast = document.createElement('div');
  toast.className = `toast toast-${options.type}`;
  toast.innerHTML = `
    <span class="toast-icon">${getIcon(options.type)}</span>
    <span class="toast-message">${options.message}</span>
  `;
  return toast;
}

export const notify = {
  success: (message: string) => showToast({ type: 'success', message }),
  error: (message: string) => showToast({ type: 'error', message }),
  warning: (message: string) => showToast({ type: 'warning', message }),
  info: (message: string) => showToast({ type: 'info', message })
};
```

**Estilos a agregar en:**
```
src/ui/styles/notifications.css
```

**Criterios de aceptación:**
- [ ] Toast aparece y desaparece con animación suave
- [ ] Soporte para 4 tipos: success, error, warning, info
- [ ] Auto-dismiss configurable (default 3s)
- [ ] Apilamiento correcto de múltiples toasts

---

### ✅ Tarea 1.2: Mejoras de Accesibilidad (A11y)

**Descripción:** Implementar atributos ARIA y navegación por teclado.

**Archivos a modificar:**
```
ui.html (y/o archivos en src/ui/components/)
src/ui/styles/accessibility.css
```

**Cambios específicos:**

| Componente | Mejora Requerida |
|------------|------------------|
| Custom Selects | `role="listbox"`, `aria-expanded`, keyboard nav (↑/↓/Enter/Esc) |
| Accordions | `role="region"`, `aria-expanded`, `aria-controls` |
| Botones con iconos | `aria-label` descriptivo |
| Mode buttons | `role="tablist"`, `role="tab"`, `aria-selected` |
| Focus states | `outline: 2px solid var(--accent-primary)` visible |

**Implementación de keyboard navigation para Custom Selects:**
```typescript
// src/ui/utils/keyboardNav.ts
export function initCustomSelectKeyboard(selectElement: HTMLElement) {
  selectElement.addEventListener('keydown', (e) => {
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusNextOption();
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusPrevOption();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        selectCurrentOption();
        break;
      case 'Escape':
        closeDropdown();
        break;
    }
  });
}
```

**CSS de focus visible:**
```css
/* src/ui/styles/accessibility.css */
.custom-select-trigger:focus-visible,
.mode-btn:focus-visible,
.btn:focus-visible,
.accordion-header:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* Skip links for screen readers */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  z-index: 9999;
}
.skip-link:focus {
  top: 0;
}
```

**Criterios de aceptación:**
- [ ] Navegación completa solo con teclado
- [ ] Screen reader puede anunciar todos los elementos interactivos
- [ ] Contraste WCAG AA mínimo (4.5:1 para texto normal)
- [ ] Focus visible en todos los elementos interactivos

---

### ✅ Tarea 1.3: Error Handling Robusto en Backend

**Descripción:** Implementar sistema centralizado de manejo de errores.

**Archivos a crear:**
```
src/code/utils/errorHandler.ts
```

**Implementación:**
```typescript
// src/code/utils/errorHandler.ts
export class PluginError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public userMessage: string,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'PluginError';
  }
}

export enum ErrorCode {
  COLLECTION_NOT_FOUND = 'COLLECTION_NOT_FOUND',
  PALETTE_NOT_FOUND = 'PALETTE_NOT_FOUND',
  VARIABLE_CREATE_FAILED = 'VARIABLE_CREATE_FAILED',
  THEME_GENERATION_FAILED = 'THEME_GENERATION_FAILED',
  INVALID_CONFIG = 'INVALID_CONFIG',
  FIGMA_API_ERROR = 'FIGMA_API_ERROR'
}

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: {
    errorMessage: string;
    errorCode: ErrorCode;
    showNotification?: boolean;
  }
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`[${context.errorCode}] ${context.errorMessage}:`, error);
    
    if (context.showNotification !== false) {
      figma.notify(`❌ ${context.errorMessage}`, { error: true, timeout: 5000 });
    }
    
    throw new PluginError(
      error instanceof Error ? error.message : String(error),
      context.errorCode,
      context.errorMessage
    );
  }
}
```

**Integración en main.ts:**
```typescript
// Ejemplo de uso en generateTheme
async function generateTheme(...) {
  return withErrorHandling(
    async () => {
      // lógica actual...
    },
    {
      errorMessage: 'Failed to generate theme',
      errorCode: ErrorCode.THEME_GENERATION_FAILED
    }
  );
}
```

**Criterios de aceptación:**
- [ ] Todos los errores se capturan y formatean consistentemente
- [ ] Usuario recibe feedback claro sobre errores
- [ ] Logs detallados para debugging
- [ ] Errores recuperables vs fatales diferenciados

---

### ✅ Tarea 1.4: Loading States y Skeleton Screens

**Descripción:** Agregar indicadores visuales durante operaciones asíncronas.

**Archivos a crear/modificar:**
```
src/ui/components/LoadingState.ts
src/ui/styles/loading.css
```

**Implementación:**
```typescript
// src/ui/components/LoadingState.ts
export class LoadingState {
  static showSkeleton(container: HTMLElement, rows: number = 3): void {
    container.innerHTML = Array(rows).fill(0)
      .map(() => `
        <div class="skeleton-row">
          <div class="skeleton skeleton-text" style="width: 60%"></div>
          <div class="skeleton skeleton-badge"></div>
        </div>
      `).join('');
  }
  
  static showSpinner(message: string = 'Loading...'): HTMLElement {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner-container';
    spinner.innerHTML = `
      <div class="loading-spinner"></div>
      <span class="loading-message">${message}</span>
    `;
    return spinner;
  }
  
  static showProgress(current: number, total: number): void {
    const progressBar = document.querySelector('.progress-bar-fill');
    if (progressBar) {
      (progressBar as HTMLElement).style.width = `${(current / total) * 100}%`;
    }
  }
}
```

**CSS:**
```css
/* src/ui/styles/loading.css */
.skeleton {
  background: linear-gradient(90deg, 
    var(--surface-secondary) 25%, 
    var(--surface-tertiary) 50%, 
    var(--surface-secondary) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--surface-secondary);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**Criterios de aceptación:**
- [ ] Skeleton screens para carga de listas de tokens
- [ ] Spinner con mensaje para operaciones largas
- [ ] Progress bar para creación de colecciones
- [ ] Transiciones suaves entre estados

---

## 🗓️ FASE 2: FUNCIONALIDADES CORE (Semana 2)
### 🎯 Objetivo: Validación de Contraste + Exportación de Temas

---

### ✅ Tarea 2.1: Validador de Contraste WCAG

**Descripción:** Agregar validación automática de accesibilidad de colores.

**Archivos a crear:**
```
src/code/validators/contrastValidator.ts
src/ui/components/ContrastWarnings.ts
```

**Implementación Backend:**
```typescript
// src/code/validators/contrastValidator.ts
interface ContrastValidation {
  token: string;
  background: string;
  foreground: string;
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  severity: 'pass' | 'warning' | 'error';
  suggestion?: string;
}

export function validateThemeContrast(
  themeData: ThemeData,
  mode: 'light' | 'dark'
): ContrastValidation[] {
  const results: ContrastValidation[] = [];
  
  // Pares críticos a validar
  const criticalPairs = [
    { fg: 'Text/primary', bg: 'Background/primary', minRatio: 4.5 },
    { fg: 'Text/secondary', bg: 'Background/primary', minRatio: 4.5 },
    { fg: 'Text/primary', bg: 'Surface/primary', minRatio: 4.5 },
    { fg: 'Action/primary', bg: 'Background/primary', minRatio: 3.0 },
    // ... más pares
  ];
  
  for (const pair of criticalPairs) {
    const fgToken = themeData.tokens[pair.fg];
    const bgToken = themeData.tokens[pair.bg];
    
    if (fgToken && bgToken) {
      const ratio = calculateContrastRatio(
        fgToken[mode].hex,
        bgToken[mode].hex
      );
      
      results.push({
        token: pair.fg,
        background: pair.bg,
        foreground: pair.fg,
        ratio,
        wcagAA: ratio >= 4.5,
        wcagAAA: ratio >= 7.0,
        severity: ratio >= 4.5 ? 'pass' : ratio >= 3.0 ? 'warning' : 'error',
        suggestion: ratio < 4.5 
          ? `Aumentar contraste (actual: ${ratio.toFixed(2)}, requerido: 4.5)`
          : undefined
      });
    }
  }
  
  return results;
}

function calculateContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hexToRgb(hex1));
  const lum2 = getLuminance(hexToRgb(hex2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}
```

**UI Component:**
```typescript
// src/ui/components/ContrastWarnings.ts
export function renderContrastWarnings(validations: ContrastValidation[]): string {
  const errors = validations.filter(v => v.severity === 'error');
  const warnings = validations.filter(v => v.severity === 'warning');
  
  if (errors.length === 0 && warnings.length === 0) {
    return `
      <div class="contrast-status contrast-pass">
        <span class="status-icon">✅</span>
        <span>All color pairs pass WCAG AA</span>
      </div>
    `;
  }
  
  return `
    <div class="contrast-warnings">
      <h4>Accessibility Issues</h4>
      ${errors.map(e => renderWarningRow(e, 'error')).join('')}
      ${warnings.map(w => renderWarningRow(w, 'warning')).join('')}
    </div>
  `;
}
```

**Criterios de aceptación:**
- [ ] Validación automática al generar tema
- [ ] Indicadores visuales en tokens con problemas
- [ ] Sugerencias de corrección específicas
- [ ] Badge de estado WCAG en preview

---

### ✅ Tarea 2.2: Exportación de Temas

**Descripción:** Permitir exportar temas en múltiples formatos.

**Archivos a crear:**
```
src/code/exporters/CSSExporter.ts
src/code/exporters/JSONExporter.ts
src/code/exporters/TailwindExporter.ts
src/code/exporters/TokensExporter.ts (Design Tokens format)
src/ui/components/ExportModal.ts
```

**Implementación CSSExporter:**
```typescript
// src/code/exporters/CSSExporter.ts
export class CSSExporter {
  export(theme: ThemeData): { light: string; dark: string; combined: string } {
    const lightVars = this.generateVars(theme, 'light');
    const darkVars = this.generateVars(theme, 'dark');
    
    return {
      light: `:root {\n${lightVars}\n}`,
      dark: `[data-theme="dark"] {\n${darkVars}\n}`,
      combined: `
/* ${theme.themeName} - Generated by PirulinoColorete */
:root {
${lightVars}
}

@media (prefers-color-scheme: dark) {
${darkVars}
}

[data-theme="dark"] {
${darkVars}
}
      `.trim()
    };
  }
  
  private generateVars(theme: ThemeData, mode: 'light' | 'dark'): string {
    return Object.entries(theme.tokens)
      .map(([name, token]) => {
        const cssName = name.toLowerCase().replace(/\//g, '-');
        return `  --${cssName}: ${token[mode].hex};`;
      })
      .join('\n');
  }
}
```

**UI Modal:**
```typescript
// src/ui/components/ExportModal.ts
export function showExportModal(theme: ThemeData): void {
  const modal = document.createElement('div');
  modal.className = 'modal export-modal';
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content">
      <h2>Export Theme: ${theme.themeName}</h2>
      
      <div class="export-formats">
        <button class="export-btn" data-format="css">
          <span class="format-icon">🎨</span>
          <span class="format-name">CSS Variables</span>
        </button>
        <button class="export-btn" data-format="json">
          <span class="format-icon">📋</span>
          <span class="format-name">JSON</span>
        </button>
        <button class="export-btn" data-format="tailwind">
          <span class="format-icon">🌊</span>
          <span class="format-name">Tailwind Config</span>
        </button>
        <button class="export-btn" data-format="tokens">
          <span class="format-icon">🎯</span>
          <span class="format-name">Design Tokens</span>
        </button>
      </div>
      
      <div class="export-preview">
        <pre><code id="export-code"></code></pre>
      </div>
      
      <div class="modal-actions">
        <button class="btn btn-secondary" data-action="close">Cancel</button>
        <button class="btn btn-primary" data-action="copy">
          📋 Copy to Clipboard
        </button>
        <button class="btn btn-primary" data-action="download">
          💾 Download File
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  initExportModalEvents(modal, theme);
}
```

**Criterios de aceptación:**
- [ ] Exportar a CSS Variables (light + dark + combined)
- [ ] Exportar a JSON estructurado
- [ ] Exportar a Tailwind config (theme.extend.colors)
- [ ] Exportar a Design Tokens (DTCG format)
- [ ] Preview del código antes de exportar
- [ ] Copiar al clipboard y descargar archivo

---

### ✅ Tarea 2.3: Presets de Temas

**Descripción:** Agregar configuraciones predefinidas basadas en design systems populares.

**Archivos a crear:**
```
src/code/presets/index.ts
src/code/presets/materialDesign.ts
src/code/presets/appleHIG.ts
src/code/presets/antDesign.ts
src/ui/components/PresetSelector.ts
```

**Ejemplo de preset:**
```typescript
// src/code/presets/materialDesign.ts
import { ThemePreset } from './types';

export const materialDesign3Preset: ThemePreset = {
  id: 'material-design-3',
  name: 'Material Design 3',
  description: 'Google\'s Material Design 3 color roles',
  icon: '🎨',
  
  tokenMappings: {
    // Background tokens
    'Background/primary': { light: '99', dark: '10' }, // surface
    'Background/secondary': { light: '96', dark: '17' }, // surface-container
    'Background/tertiary': { light: '94', dark: '22' }, // surface-container-high
    
    // Text tokens
    'Text/primary': { light: '10', dark: '90' }, // on-surface
    'Text/secondary': { light: '30', dark: '80' }, // on-surface-variant
    
    // Action tokens
    'Action/primary': { light: '40', dark: '80' }, // primary
    'Action/onPrimary': { light: '100', dark: '20' }, // on-primary
    
    // Surface tokens
    'Surface/primary': { light: '100', dark: '12' },
    'Surface/secondary': { light: '96', dark: '17' },
    
    // Border tokens
    'Border/primary': { light: '80', dark: '30' }, // outline
    'Border/secondary': { light: '90', dark: '20' }, // outline-variant
    
    // Status - uses semantic palettes
    'Status/success': { light: '40', dark: '80', useStatus: 'success' },
    'Status/warning': { light: '40', dark: '80', useStatus: 'warning' },
    'Status/error': { light: '40', dark: '80', useStatus: 'error' }
  },
  
  recommendations: {
    accentPalette: 'Should have good saturation for primary actions',
    neutralPalette: 'Use a desaturated palette with subtle hue'
  }
};
```

**Criterios de aceptación:**
- [ ] Mínimo 3 presets disponibles (Material Design 3, Apple HIG, Ant Design)
- [ ] Preview del resultado antes de aplicar
- [ ] Permite personalizar después de aplicar preset
- [ ] Opción de guardar presets personalizados (futuro)

---

## 🗓️ FASE 3: MEJORAS DE UX (Semana 3)
### 🎯 Objetivo: Búsqueda, Atajos de Teclado, Optimizaciones

---

### ✅ Tarea 3.1: Barra de Búsqueda de Tokens

**Descripción:** Implementar búsqueda rápida de tokens en el editor.

**Archivos a crear:**
```
src/ui/components/TokenSearch.ts
src/ui/styles/search.css
```

**Implementación:**
```typescript
// src/ui/components/TokenSearch.ts
export class TokenSearch {
  private searchInput: HTMLInputElement;
  private allTokenRows: HTMLElement[];
  
  constructor(container: HTMLElement) {
    this.createSearchUI(container);
    this.allTokenRows = Array.from(
      document.querySelectorAll('.token-row')
    ) as HTMLElement[];
  }
  
  private createSearchUI(container: HTMLElement): void {
    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'token-search-wrapper';
    searchWrapper.innerHTML = `
      <div class="search-input-container">
        <span class="search-icon">🔍</span>
        <input 
          type="search" 
          class="search-input"
          placeholder="Search tokens... (⌘K)"
          aria-label="Search tokens"
        />
        <kbd class="search-shortcut">⌘K</kbd>
      </div>
      <div class="search-results-count"></div>
    `;
    
    container.prepend(searchWrapper);
    this.searchInput = searchWrapper.querySelector('.search-input')!;
    this.attachEvents();
  }
  
  private attachEvents(): void {
    // Debounced search
    let timeout: number;
    this.searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.filterTokens((e.target as HTMLInputElement).value);
      }, 150);
    });
    
    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.searchInput.focus();
        this.searchInput.select();
      }
    });
  }
  
  private filterTokens(query: string): void {
    const normalizedQuery = query.toLowerCase().trim();
    let visibleCount = 0;
    
    this.allTokenRows.forEach(row => {
      const tokenName = row.getAttribute('data-token-name')?.toLowerCase() || '';
      const matches = normalizedQuery === '' || tokenName.includes(normalizedQuery);
      
      row.style.display = matches ? '' : 'none';
      if (matches) visibleCount++;
    });
    
    // Update accordion visibility
    this.updateAccordionVisibility();
    
    // Update results count
    const countEl = document.querySelector('.search-results-count');
    if (countEl) {
      countEl.textContent = query 
        ? `${visibleCount} of ${this.allTokenRows.length} tokens`
        : '';
    }
  }
  
  private updateAccordionVisibility(): void {
    document.querySelectorAll('.accordion-section').forEach(section => {
      const visibleRows = section.querySelectorAll('.token-row:not([style*="display: none"])');
      (section as HTMLElement).style.display = visibleRows.length > 0 ? '' : 'none';
    });
  }
}
```

**Criterios de aceptación:**
- [ ] Búsqueda en tiempo real con debounce
- [ ] Atajo ⌘K / Ctrl+K para focus
- [ ] Highlight de resultados
- [ ] Contador de resultados
- [ ] Oculta secciones vacías

---

### ✅ Tarea 3.2: Sistema de Atajos de Teclado

**Descripción:** Implementar atajos para acciones frecuentes.

**Archivos a crear:**
```
src/ui/utils/shortcuts.ts
src/ui/components/ShortcutsHelp.ts
```

**Implementación:**
```typescript
// src/ui/utils/shortcuts.ts
interface Shortcut {
  key: string;
  modifiers: ('meta' | 'ctrl' | 'alt' | 'shift')[];
  action: () => void;
  description: string;
  category: 'navigation' | 'actions' | 'editing';
}

class ShortcutManager {
  private shortcuts: Map<string, Shortcut> = new Map();
  private enabled: boolean = true;
  
  constructor() {
    this.initEventListener();
  }
  
  register(shortcut: Shortcut): void {
    const key = this.getKey(shortcut.key, shortcut.modifiers);
    this.shortcuts.set(key, shortcut);
  }
  
  private getKey(key: string, modifiers: string[]): string {
    return [...modifiers.sort(), key.toLowerCase()].join('+');
  }
  
  private initEventListener(): void {
    document.addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      
      // Don't trigger when typing in inputs
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        // Allow some shortcuts even in inputs
        if (!e.metaKey && !e.ctrlKey) return;
      }
      
      const modifiers: string[] = [];
      if (e.metaKey) modifiers.push('meta');
      if (e.ctrlKey) modifiers.push('ctrl');
      if (e.altKey) modifiers.push('alt');
      if (e.shiftKey) modifiers.push('shift');
      
      const key = this.getKey(e.key, modifiers);
      const shortcut = this.shortcuts.get(key);
      
      if (shortcut) {
        e.preventDefault();
        shortcut.action();
      }
    });
  }
  
  getAll(): Shortcut[] {
    return Array.from(this.shortcuts.values());
  }
}

export const shortcuts = new ShortcutManager();

// Register default shortcuts
shortcuts.register({
  key: 'k',
  modifiers: ['meta'],
  action: () => document.querySelector<HTMLInputElement>('.search-input')?.focus(),
  description: 'Search tokens',
  category: 'navigation'
});

shortcuts.register({
  key: 's',
  modifiers: ['meta'],
  action: () => document.querySelector<HTMLButtonElement>('#create-collection-btn')?.click(),
  description: 'Save/Create collection',
  category: 'actions'
});

shortcuts.register({
  key: 'e',
  modifiers: ['meta'],
  action: () => openExportModal(),
  description: 'Export theme',
  category: 'actions'
});

shortcuts.register({
  key: '?',
  modifiers: ['shift'],
  action: () => showShortcutsHelp(),
  description: 'Show keyboard shortcuts',
  category: 'navigation'
});

```

**Criterios de aceptación:**
- [ ] ⌘K: Búsqueda rápida
- [ ] ⌘S: Guardar/Crear colección
- [ ] ⌘E: Exportar tema
- [ ] Shift+?: Mostrar ayuda de atajos
- [ ] Escape: Cerrar modales/dropdowns
- [ ] Help modal con lista de atajos

---

### ✅ Tarea 3.3: Optimizaciones de Rendimiento

**Descripción:** Implementar lazy loading y debouncing.

**Archivos a modificar:**
```
src/code/main.ts (funciones de carga)
src/ui/utils/performance.ts
```

**Implementaciones:**

**Debouncing:**
```typescript
// src/ui/utils/performance.ts
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | undefined;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

**Lazy Loading de Paletas:**
```typescript
// En main.ts
const paletteCache = new Map<string, Record<string, string>>();

async function loadPaletteOnDemand(
  paletteName: string,
  collectionId: string
): Promise<Record<string, string>> {
  const cacheKey = `${collectionId}:${paletteName}`;
  
  if (paletteCache.has(cacheKey)) {
    return paletteCache.get(cacheKey)!;
  }
  
  const palette = await fetchPaletteColors(paletteName, collectionId);
  paletteCache.set(cacheKey, palette);
  
  return palette;
}

function clearPaletteCache(): void {
  paletteCache.clear();
}
```

**Virtual Scrolling (para listas muy largas):**
```typescript
// src/ui/components/VirtualList.ts
export class VirtualList {
  private itemHeight: number = 60;
  private visibleCount: number;
  private scrollTop: number = 0;
  
  constructor(
    private container: HTMLElement,
    private items: any[],
    private renderItem: (item: any, index: number) => HTMLElement
  ) {
    this.visibleCount = Math.ceil(container.clientHeight / this.itemHeight) + 2;
    this.setupScrollListener();
    this.render();
  }
  
  private render(): void {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(startIndex + this.visibleCount, this.items.length);
    
    const fragment = document.createDocumentFragment();
    
    // Spacer for items above
    const topSpacer = document.createElement('div');
    topSpacer.style.height = `${startIndex * this.itemHeight}px`;
    fragment.appendChild(topSpacer);
    
    // Visible items
    for (let i = startIndex; i < endIndex; i++) {
      const itemEl = this.renderItem(this.items[i], i);
      itemEl.style.height = `${this.itemHeight}px`;
      fragment.appendChild(itemEl);
    }
    
    // Spacer for items below
    const bottomSpacer = document.createElement('div');
    bottomSpacer.style.height = `${(this.items.length - endIndex) * this.itemHeight}px`;
    fragment.appendChild(bottomSpacer);
    
    this.container.innerHTML = '';
    this.container.appendChild(fragment);
  }
}
```

**Criterios de aceptación:**
- [ ] Regeneración de tema debounced (300ms)
- [ ] Paletas cacheadas después de primera carga
- [ ] Virtual scrolling para +100 tokens
- [ ] Tiempo de respuesta <100ms para cambios de token

---

---

### � Fase 3: Auditoría y Corrección de Variables (COMPLETADA)
> **Estado:** ✅ FINALIZADA (12/12/2025)
> **Objetivo:** Asegurar que el sistema de variables esté completo antes de crear componentes

#### 3.1. Auditoría del Sistema Actual ✅
- [x] Identificar variables faltantes (gaps) para componentes atómicos
- [x] Verificar consistencia de naming
- [x] Validar mapeo de primitivas a semánticos
- [x] Documentar gaps en `AUDITORIA_VARIABLES.md`

#### 3.2. Implementación de Fixes ✅
- [x] **Typography:** Implementar Font Family aliases (`heading`, `body`, `code`)
- [x] **Typography:** Implementar Line Height tokens (`none` a `loose`)
- [x] **Typography:** Implementar responsive tokens para Code/Mono
- [x] **Spacing:** Expandir escala de `Gap`, `Padding`, `Radius` (xs, xl, 3xs, 2xl)
- [x] **Spacing:** Implementar tokens de Border Width (`thin`, `medium`, `thick`)
- [x] **Colors:** Implementar tokens de estado interactivo (`hover`, `active`, `disabled`)
- [x] **Colors:** Completar sistema semántico (`Text/link`, `Icon/*`, `Interactive/focus`)
- [x] **Cleanup:** Refactorización de código y corrección de errores de compilación en `main.ts`

---

## �️ Fase 4: Componentes Atómicos (PRÓXIMA)
> **Estado:** 🟡 PREPARADA
> **Objetivo:** Construir la librería de componentes usando el sistema de variables robusto

### 4.1. Configuración Inicial
- [ ] Definir estructura de archivos (`src/code/components/`)
- [ ] Estandarizar propiedades de componentes (Component Properties)

### 4.2. Componentes Base (Átomos)
- [ ] **Button:** Variantes (Primary, Secondary, Ghost, Destructive) y estados
- [ ] **Input:** Fields con validación y estados (Default, Focus, Error)
- [ ] **Badge/Tag:** Indicadores de estado con variables semánticas
- [ ] **Icon Wrapper:** Contenedor estandarizado para iconos con tokens `Icon/*`

### 4.3. Refactoring Técnico (Post-Componentes)
- [ ] Modularizar `main.ts` en archivos más pequeños
- [ ] Optimizar rendimiento de generación de temas
- [ ] Implementar tests automatizados

---
### (Sección Original Legacy: Calidad y Documentación)


### ✅ Tarea 4.1: Refactoring a Módulos

**Descripción:** Reorganizar el código en módulos más pequeños y manejables.

**Estructura propuesta:**
```
src/
├── code/
│   ├── main.ts              (entry point, reducido)
│   ├── services/
│   │   ├── CollectionService.ts
│   │   ├── VariableService.ts
│   │   ├── ThemeService.ts
│   │   └── PaletteService.ts
│   ├── utils/
│   │   ├── colorUtils.ts
│   │   ├── contrastUtils.ts
│   │   ├── scaleUtils.ts
│   │   └── errorHandler.ts
│   ├── validators/
│   │   └── contrastValidator.ts
│   ├── exporters/
│   │   ├── CSSExporter.ts
│   │   ├── JSONExporter.ts
│   │   └── TailwindExporter.ts
│   ├── presets/
│   │   └── index.ts
│   └── types/
│       ├── theme.types.ts
│       ├── variable.types.ts
│       └── palette.types.ts
├── ui/
│   ├── components/
│   ├── sections/
│   ├── styles/
│   └── utils/
```

**Criterios de aceptación:**
- [ ] Cada módulo <300 líneas
- [ ] Exports claros y documentados
- [ ] Sin dependencias circulares
- [ ] main.ts solo importa y orquesta

---

### ✅ Tarea 4.2: Configuración de Testing

**Descripción:** Configurar Jest y escribir tests unitarios críticos.

**Archivos a crear:**
```
package.json (actualizar con dependencias de test)
jest.config.js
tests/
├── unit/
│   ├── colorUtils.test.ts
│   ├── contrastValidator.test.ts
│   └── exporters.test.ts
├── integration/
│   └── themeGeneration.test.ts
└── setup.ts
```

**Configuración Jest:**
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

**Ejemplo de test:**
```typescript
// tests/unit/colorUtils.test.ts
import { rgbToHex, parseColor, calculateContrastRatio } from '@/code/utils/colorUtils';

describe('colorUtils', () => {
  describe('rgbToHex', () => {
    it('converts red correctly', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#FF0000');
    });
    
    it('converts white correctly', () => {
      expect(rgbToHex(255, 255, 255)).toBe('#FFFFFF');
    });
    
    it('handles object input', () => {
      expect(rgbToHex({ r: 0, g: 128, b: 255 })).toBe('#0080FF');
    });
  });
  
  describe('calculateContrastRatio', () => {
    it('returns 21:1 for black on white', () => {
      expect(calculateContrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
    });
    
    it('returns 1:1 for same colors', () => {
      expect(calculateContrastRatio('#FF0000', '#FF0000')).toBe(1);
    });
  });
});
```

**Criterios de aceptación:**
- [ ] Jest configurado con TypeScript
- [ ] Cobertura mínima 80%
- [ ] Tests para funciones de color
- [ ] Tests para validador de contraste
- [ ] Tests para exportadores
- [ ] npm run test funciona

---

### ✅ Tarea 4.3: Documentación Completa

**Descripción:** Crear documentación de usuario y desarrollador.

**Archivos a crear/actualizar:**
```
README.md (mejorado)
docs/
├── USER_GUIDE.md
├── DEVELOPER_GUIDE.md
├── API_REFERENCE.md
└── CONTRIBUTING.md
CHANGELOG.md
```

**README mejorado:**
```markdown
# 🎨 PirulinoColorete - Design Architect

> A powerful Figma plugin for generating comprehensive theme systems from color palettes.

[![Made for Figma](https://img.shields.io/badge/Made%20for-Figma-blue?logo=figma)](https://figma.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-GPL%20v3-green)](LICENSE)

## ✨ Features

- 🌈 **Automatic Theme Generation** - Create complete design token systems from color palettes
- 🌓 **Light & Dark Mode** - Full support for dual-mode themes
- ♿ **WCAG Validation** - Built-in accessibility contrast checking
- 📦 **Multi-Format Export** - CSS, JSON, Tailwind, Design Tokens
- 🎯 **Theme Presets** - Material Design 3, Apple HIG, and more
- 🔍 **Token Search** - Quick find with ⌘K
- ⌨️ **Keyboard Shortcuts** - Power user friendly

## 🚀 Quick Start

1. **Install the plugin** from Figma Community
2. **Select a collection** containing color palettes (with 50-950 scales)
3. **Choose palettes** for accent, neutral, success, warning, error
4. **Generate theme** and preview in light/dark modes
5. **Customize tokens** in the editor
6. **Create collection** or export to code

## 📖 Documentation

- [User Guide](docs/USER_GUIDE.md) - Complete usage instructions
- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Technical documentation
- [API Reference](docs/API_REFERENCE.md) - Backend functions reference
- [Contributing](CONTRIBUTING.md) - How to contribute

## 🛠️ Development

\`\`\`bash
# Install dependencies
npm install

# Build plugin
npm run build

# Build with watch mode
npm run watch

# Run tests
npm run test
\`\`\`

## 🗺️ Roadmap

- [ ] Theme import from JSON/CSS
- [ ] Side-by-side theme comparison
- [ ] Undo/Redo history
- [ ] Custom preset saving
- [ ] Figma Tokens sync

## 📝 License

GNU General Public License v3.0 - see [LICENSE](LICENSE)
```

**Criterios de aceptación:**
- [ ] README con badges, features, quick start
- [ ] User Guide con screenshots
- [ ] Developer Guide con arquitectura
- [ ] API Reference con JSDoc
- [ ] Contributing guidelines
- [ ] CHANGELOG con historial

---

### ✅ Tarea 4.4: Configuración de Linting

**Descripción:** Configurar ESLint y Prettier para consistencia de código.

**Archivos a crear:**
```
.eslintrc.json
.prettierrc
.eslintignore
```

**ESLint config:**
```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": ["warn", { "allow": ["error", "warn"] }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  },
  "ignorePatterns": ["node_modules/", "*.js", "code.js"]
}
```

**Prettier config:**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Scripts en package.json:**
```json
{
  "scripts": {
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts"
  }
}
```

**Criterios de aceptación:**
- [ ] ESLint configurado con reglas TypeScript
- [ ] Prettier para formato automático
- [ ] npm run lint funciona sin errores críticos
- [ ] npm run format aplica estilo consistente

---

## 📊 Resumen de Entregas

| Fase | Semana | Tareas | Entregables Clave |
|------|--------|--------|-------------------|
| **1** | S1 | 1.1, 1.2, 1.3, 1.4 | Sistema de notificaciones, Accesibilidad, Error handling, Loading states |
| **2** | S2 | 2.1, 2.2, 2.3 | Validador WCAG, Exportación multi-formato, Presets |
| **3** | S3 | 3.1, 3.2, 3.3 | Búsqueda, Atajos, Optimizaciones rendimiento |
| **4** | S4 | 4.1, 4.2, 4.3, 4.4 | Refactoring, Tests, Documentación, Linting |

---

## 📈 Métricas de Éxito

- **Performance:** < 100ms regeneración de tema
- **Accesibilidad:** WCAG AA compliance en UI del plugin
- **Cobertura de tests:** > 80%
- **Errores:** < 1% de operaciones fallidas
- **Documentación:** 100% de funciones públicas documentadas

---

## 🚦 Próximos Pasos Inmediatos

1. **Hoy:** Crear estructura de carpetas para nuevos módulos
2. **Mañana:** Implementar sistema de notificaciones (Tarea 1.1)
3. **Esta semana:** Completar Fase 1 completa

---

*Plan generado el 2025-12-12 | PirulinoColorete v1.0*
