# 🔍 Auditoría del Sistema de Variables - PirulinoColorete

> **Fecha:** 2025-12-12  
> **Objetivo:** Identificar gaps y inconsistencias antes de pasar a la etapa de componentes atómicos  
> **Estado:** ✅ GAPS CRÍTICOS CORREGIDOS (2025-12-12)

---

## 📋 Resumen de Gaps Identificados

| Categoría | Gap | Impacto | Estado |
|-----------|-----|---------|--------|
| Typography | Font Family `Code` sin aliases | ❌ Crítico | ✅ **CORREGIDO** |
| Typography | No hay aliases para Line Height | ❌ Crítico | ✅ **CORREGIDO** |
| Typography | No hay responsive tokens para Code/Mono | ⚠️ Medio | ✅ **CORREGIDO** |
| Typography | No hay Font Weight semánticos | ⚠️ Medio | ✅ **CORREGIDO** |
| Typography | Faltan Label, Overline, Quote | ⚠️ Medio | ✅ **CORREGIDO** |
| Spacing | Faltan tokens para `Border Width` | ⚠️ Medio | ✅ **CORREGIDO** |
| Spacing | Faltan tokens para `Section` spacing | ⚠️ Medio | ✅ **CORREGIDO** |
| Spacing | Faltan tokens Gap 3xs, 2xl | ⚠️ Medio | ✅ **CORREGIDO** |
| Spacing | Faltan tokens Padding xs, xl | ⚠️ Medio | ✅ **CORREGIDO** |
| Spacing | Faltan tokens Radius xs, xl | ⚠️ Medio | ✅ **CORREGIDO** |
| Colors | No hay tokens para estados `hover`, `active`, `disabled` | ⚠️ Medio | ✅ **CORREGIDO** |
| Colors | Falta `Text/link` y `Text/linkHover` | ⚠️ Medio | ✅ **CORREGIDO** |
| Colors | Falta `Icon/*` tokens | ⚠️ Medio | ✅ **CORREGIDO** |
| Colors | Falta `Interactive/focus` | ⚠️ Medio | ✅ **CORREGIDO** |
| Effects | No hay variables para `Shadow` | 💡 Bajo | 🟡 Pendiente |
| Effects | No hay variables para `Opacity` | 💡 Bajo | 🟡 Pendiente |

---

## 1. 🔤 TYPOGRAPHY SYSTEM

### ✅ Variable Primitivas Creadas (createTypographyVariables)

```
📁 Typography/ (o grupo personalizado)
├── Font Family/
│   ├── Heading  ✅
│   ├── Body     ✅
│   └── Code     ✅ (se crea la variable)
├── Font Weight/
│   ├── Thin (100)      ✅
│   ├── ExtraLight (200) ✅
│   ├── Light (300)      ✅
│   ├── Regular (400)    ✅
│   ├── Medium (500)     ✅
│   ├── SemiBold (600)   ✅
│   ├── Bold (700)       ✅
│   ├── ExtraBold (800)  ✅
│   ├── Black (900)      ✅
│   └── ExtraBlack (950) ✅
├── Font Size/
│   ├── 3xs (8px)   ✅
│   ├── 2xs (10px)  ✅
│   ├── xs (12px)   ✅
│   ├── sm (14px)   ✅
│   ├── base (16px) ✅
│   ├── lg (18px)   ✅
│   ├── xl (20px)   ✅
│   ├── 2xl (24px)  ✅
│   ├── 3xl (30px)  ✅
│   ├── 4xl (36px)  ✅
│   ├── 5xl (48px)  ✅
│   ├── 6xl (60px)  ✅
│   └── 7xl (72px)  ✅
└── Letter Spacing/
    ├── -2, -1, 0, 1, 2, 4, 8, 10 ✅
```

### ❌ Aliases Semánticos (createSemanticTokens) - GAPS

**Estructura Actual de textMap:**
```typescript
const textMap = [
  { name: 'Typography/Caption', desktop: 'xs', ... },
  { name: 'Typography/Body/s', desktop: 'sm', ... },
  { name: 'Typography/Body/m', desktop: 'base', ... },
  { name: 'Typography/Body/l', desktop: 'lg', ... },
  { name: 'Typography/Heading/h4', desktop: '2xl', ... },
  { name: 'Typography/Heading/h3', desktop: '3xl', ... },
  { name: 'Typography/Heading/h2', desktop: '4xl', ... },
  { name: 'Typography/Heading/h1', desktop: '5xl', ... },
  { name: 'Typography/Display/h2', desktop: '6xl', ... },
  { name: 'Typography/Display/h1', desktop: '7xl', ... },
];
```

**❌ FALTAN:**

| Token Faltante | Descripción | Sugerencia |
|----------------|-------------|------------|
| `Typography/Code/inline` | Código inline en texto | desktop: sm, tablet: sm, mobile: xs |
| `Typography/Code/block` | Bloques de código | desktop: sm, tablet: sm, mobile: xs |
| `Typography/Label` | Labels de inputs | desktop: xs, tablet: xs, mobile: xs |
| `Typography/Overline` | Texto uppercase pequeño | desktop: 2xs, tablet: 2xs, mobile: 2xs |
| `Typography/Quote` | Blockquotes | desktop: lg, tablet: base, mobile: base |

**❌ NO HAY ALIAS PARA FONT FAMILY:**

Actualmente `createSemanticTokens` solo crea aliases de `Font Size`.
No existen aliases para indicar qué fuente usar en cada contexto:

| Token Faltante | Mapeo Sugerido |
|----------------|----------------|
| `Typography/Font/heading` | → Font Family/Heading |
| `Typography/Font/body` | → Font Family/Body |
| `Typography/Font/code` | → Font Family/Code |

**❌ NO HAY TOKENS DE LINE HEIGHT:**

| Token Faltante | Valor Sugerido |
|----------------|----------------|
| `Typography/Leading/none` | 1 |
| `Typography/Leading/tight` | 1.25 |
| `Typography/Leading/snug` | 1.375 |
| `Typography/Leading/normal` | 1.5 |
| `Typography/Leading/relaxed` | 1.625 |
| `Typography/Leading/loose` | 2 |

**❌ NO HAY TOKENS DE FONT WEIGHT SEMÁNTICOS:**

| Token Faltante | Mapeo |
|----------------|-------|
| `Typography/Weight/normal` | → Regular (400) |
| `Typography/Weight/medium` | → Medium (500) |
| `Typography/Weight/semibold` | → SemiBold (600) |
| `Typography/Weight/bold` | → Bold (700) |

---

## 2. 📐 SPACING SYSTEM

### ✅ Variables Primitivas Creadas (createMeasureVariables)

```
📁 Measures/ (o grupo personalizado)
├── 2px  ✅
├── 4px  ✅
├── 8px  ✅
├── 12px ✅
├── 16px ✅
├── 20px ✅
├── 24px ✅
├── 32px ✅
├── 48px ✅
├── 64px ✅ (si incluido)
└── ...
```

### ⚠️ Aliases Semánticos (createSemanticTokens) - GAPS PARCIALES

**Estructura Actual de spaceMap:**
```typescript
const spaceMap = [
  // Gap
  { name: 'Spacing/Gap/2xs', desktop: '4px', ... },
  { name: 'Spacing/Gap/xs', desktop: '8px', ... },
  { name: 'Spacing/Gap/s', desktop: '16px', ... },
  { name: 'Spacing/Gap/m', desktop: '24px', ... },
  { name: 'Spacing/Gap/l', desktop: '32px', ... },
  { name: 'Spacing/Gap/xl', desktop: '48px', ... },
  
  // Padding
  { name: 'Spacing/Padding/sm', desktop: '16px', ... },
  { name: 'Spacing/Padding/md', desktop: '24px', ... },
  { name: 'Spacing/Padding/lg', desktop: '32px', ... },
  
  // Radius
  { name: 'Spacing/Radius/s', desktop: '4px', ... },
  { name: 'Spacing/Radius/m', desktop: '8px', ... },
  { name: 'Spacing/Radius/l', desktop: '12px', ... },
];
```

**❌ FALTAN:**

| Token Faltante | Descripción |
|----------------|-------------|
| `Spacing/Gap/3xs` | Gap mínimo (2px) |
| `Spacing/Padding/xs` | Padding pequeño (8px) |
| `Spacing/Padding/xl` | Padding extra grande (48px) |
| `Spacing/Radius/xs` | Radius mínimo (2px) |
| `Spacing/Radius/xl` | Radius grande (16px) |
| `Spacing/Radius/full` | Radius circular (9999px) |
| `Spacing/Border/thin` | Border width 1px |
| `Spacing/Border/medium` | Border width 2px |
| `Spacing/Border/thick` | Border width 4px |
| `Spacing/Section/sm` | Espaciado entre secciones pequeño |
| `Spacing/Section/md` | Espaciado entre secciones medio |
| `Spacing/Section/lg` | Espaciado entre secciones grande |

---

## 3. 🎨 COLOR SYSTEM (Theme Tokens)

### ✅ Tokens Creados (TOKEN_SCHEMA)

```
Background/
├── primary    ✅
├── secondary  ✅
└── tertiary   ✅

Text/
├── primary    ✅
├── secondary  ✅
├── tertiary   ✅
└── brand      ✅

Surface/
├── card       ✅
├── modal      ✅
└── overlay    ✅

Border/
├── default    ✅
├── subtle     ✅
├── focus      ✅
└── error      ✅

Action/
├── primary       ✅
├── primaryHover  ✅
├── secondary     ✅
└── destructive   ✅

Status/
├── success    ✅
├── successBg  ✅
├── warning    ✅
├── warningBg  ✅
├── error      ✅
└── errorBg    ✅
```

### ❌ FALTAN:

| Token Faltante | Descripción | Light | Dark |
|----------------|-------------|-------|------|
| **Background/** | | | |
| `Background/brand` | Fondo con color de marca | accent-100 | accent-900 |
| `Background/inverse` | Fondo invertido | neutral-900 | neutral-50 |
| **Text/** | | | |
| `Text/link` | Color de enlaces | accent-600 | accent-400 |
| `Text/linkHover` | Hover de enlaces | accent-700 | accent-300 |
| `Text/inverse` | Texto sobre fondos oscuros | neutral-50 | neutral-900 |
| `Text/disabled` | Texto deshabilitado | neutral-400 | neutral-600 |
| `Text/placeholder` | Placeholder de inputs | neutral-400 | neutral-500 |
| **Surface/** | | | |
| `Surface/elevated` | Superficie elevada | neutral-50 | neutral-700 |
| `Surface/hover` | Superficie en hover | neutral-100 | neutral-750 |
| `Surface/pressed` | Superficie presionada | neutral-200 | neutral-700 |
| `Surface/disabled` | Superficie deshabilitada | neutral-100 | neutral-800 |
| **Border/** | | | |
| `Border/strong` | Borde fuerte | neutral-400 | neutral-500 |
| `Border/disabled` | Borde deshabilitado | neutral-200 | neutral-700 |
| `Border/success` | Borde de éxito | success-500 | success-400 |
| `Border/warning` | Borde de advertencia | warning-500 | warning-400 |
| **Action/** | | | |
| `Action/primaryActive` | Botón primario presionado | accent-800 | accent-200 |
| `Action/primaryDisabled` | Botón primario deshabilitado | accent-300 | accent-700 |
| `Action/secondaryHover` | Hover de botón secundario | neutral-200 | neutral-700 |
| `Action/ghost` | Botón fantasma | transparent | transparent |
| `Action/ghostHover` | Hover de botón fantasma | neutral-100 | neutral-800 |
| **Interactive/** | | | |
| `Interactive/focus` | Ring de focus | accent-500 | accent-400 |
| `Interactive/focusRing` | Outline de focus | accent-500/50 | accent-400/50 |
| **Icon/** | | | |
| `Icon/primary` | Icono principal | neutral-700 | neutral-300 |
| `Icon/secondary` | Icono secundario | neutral-500 | neutral-400 |
| `Icon/brand` | Icono de marca | accent-600 | accent-400 |
| `Icon/disabled` | Icono deshabilitado | neutral-300 | neutral-600 |

---

## 4. 🌫️ EFFECTS SYSTEM (No implementado)

### ❌ Variables Faltantes Completas

**Shadows:**
```
Effects/Shadow/
├── none      → 0 0 0 0 transparent
├── xs        → 0 1px 2px 0 rgba(0,0,0,0.05)
├── sm        → 0 1px 3px 0 rgba(0,0,0,0.1)
├── md        → 0 4px 6px -1px rgba(0,0,0,0.1)
├── lg        → 0 10px 15px -3px rgba(0,0,0,0.1)
├── xl        → 0 20px 25px -5px rgba(0,0,0,0.1)
├── 2xl       → 0 25px 50px -12px rgba(0,0,0,0.25)
├── inner     → inset 0 2px 4px 0 rgba(0,0,0,0.05)
└── focusRing → 0 0 0 3px rgba(accent,0.5)
```

**Opacity:**
```
Effects/Opacity/
├── 0    → 0
├── 5    → 0.05
├── 10   → 0.1
├── 25   → 0.25
├── 50   → 0.5
├── 75   → 0.75
├── 90   → 0.9
├── 95   → 0.95
└── 100  → 1
```

**Blur:**
```
Effects/Blur/
├── none   → 0
├── sm     → 4px
├── md     → 8px
├── lg     → 16px
├── xl     → 24px
└── 2xl    → 40px
```

**Transitions:**
```
Effects/Duration/
├── instant  → 0ms
├── fast     → 150ms
├── normal   → 300ms
├── slow     → 500ms
└── slower   → 700ms
```

---

## 5. 📝 ACCIONES REQUERIDAS

### 🔴 Prioridad Alta (Antes de Componentes)

1. **Agregar aliases de Font Family**
   - [ ] Modificar `createSemanticTokens` para incluir aliases de fuentes
   - [ ] Crear `Typography/Font/heading`, `body`, `code`

2. **Agregar tokens de Line Height**
   - [ ] Crear variables primitivas para line-height
   - [ ] Crear aliases semánticos responsivos

3. **Agregar tokens de Code/Mono**
   - [ ] Agregar a textMap: `Typography/Code/inline`, `Typography/Code/block`

4. **Completar tokens de estados interactivos**
   - [ ] Agregar `disabled`, `hover`, `active`, `focus` a colores

### 🟡 Prioridad Media (Durante Componentes)

5. **Completar Spacing tokens**
   - [ ] Agregar Border Width primitivos
   - [ ] Agregar tokens de Section spacing

6. **Agregar tokens de Icon**
   - [ ] `Icon/primary`, `secondary`, `brand`, `disabled`

7. **Agregar tokens de Link**
   - [ ] `Text/link`, `Text/linkHover`, `Text/linkVisited`

### 🟢 Prioridad Baja (Post-Componentes)

8. **Sistema de Effects**
   - [ ] Shadows
   - [ ] Opacity
   - [ ] Blur
   - [ ] Duration/Transitions

---

## 6. 📐 EJEMPLO DE SOLUCIÓN PARA FONT FAMILY CODE

**Modificación requerida en `main.ts` - `createSemanticTokens`:**

```typescript
// AGREGAR después de textMap (línea ~727)
const fontMap = [
  { name: 'Typography/Font/heading', key: 'Heading' },
  { name: 'Typography/Font/body', key: 'Body' },
  { name: 'Typography/Font/code', key: 'Code' },
];

// Procesar Font Family aliases
for (const item of fontMap) {
  const fontVar = allVars.find(v => 
    v.variableCollectionId === sourceCollectionId && 
    v.name.endsWith(`/Font Family/${item.key}`)
  );
  
  if (fontVar) {
    const targetVar = await findOrCreateVar(item.name);
    // Note: Font Family are STRING type, need special handling
    // Set as alias to primitivo
    targetVar.setValueForMode(desktopId, { type: 'VARIABLE_ALIAS', id: fontVar.id });
    targetVar.setValueForMode(tabletId, { type: 'VARIABLE_ALIAS', id: fontVar.id });
    targetVar.setValueForMode(mobileId, { type: 'VARIABLE_ALIAS', id: fontVar.id });
  }
}
```

---

*Auditoría generada el 2025-12-12 | PirulinoColorete Design System*
