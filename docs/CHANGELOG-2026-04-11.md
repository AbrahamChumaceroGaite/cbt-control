# Changelog — cbt-control-aula
**Fecha:** 2026-04-11  
**Rama activa:** `develop`  
**Estado final:** 284 web tests · 145 api tests · 429 total · builds en 0 errores

---

## Resumen ejecutivo

| Métrica | Valor |
|---------|-------|
| Tests pasando — Frontend (web/) | 284 (+23 vs sesión anterior) |
| Tests pasando — Backend (api/) | 145 (+41 vs sesión anterior) |
| **Total tests pasando** | **429** |
| Archivos eliminados (zombie/duplicados) | 9 |
| Archivos nuevos (componentes shared) | 4 |
| LOC neto eliminado | ~490 |
| Constantes locales centralizadas | 18 |
| Tokens de estilo centralizados en scheme.ts | 26 exports |
| Magic z-index values eliminados | 5 |
| Modales duplicados eliminados | 2 (LogoutModal, NoteModal inline) |

---

## Parte 1 — CVA refactor (class-variance-authority)

### 1.1 — Instalación

`class-variance-authority@0.7.1` instalado como dependencia en `web/package.json`.  
`package-lock.json` actualizado para incluir la entrada (corrige error `npm ci` en CI).

### 1.2 — Componentes atoms refactorizados con CVA

| Archivo | Variantes añadidas | Tipo exportado |
|---------|--------------------|----------------|
| `components/ui/button.tsx` | `variant` (7 valores) × `size` (4 valores) | `ButtonVariants` |
| `components/ui/badge.tsx` | `variant` (7 valores) | `BadgeVariants` |
| `components/ui/status-badge.tsx` | `status` (6 valores) × `size` (2 valores) | — |
| `components/shared/FilterPills.tsx` | `state` × `accent` compoundVariants | `PillVariants` |
| `components/ui/modal.tsx` | `size` ('sm' \| 'md' \| 'lg') reemplaza bool `lg` | `ModalSize` |

### 1.3 — Componentes shared nuevos (CVA)

| Archivo nuevo | Variantes | Consumidores |
|---------------|-----------|-------------|
| `components/shared/RankBadge.tsx` | `rank`: first / second / third / default | StudentRanking |
| `components/shared/RewardMilestoneButton.tsx` | `state`: reached / next / locked | StudentRanking, RewardsTimeline |
| `components/shared/RewardTypeBadge.tsx` | `type`: class / individual | RewardCard |
| `components/shared/index.ts` | Barrel de todos los exports shared | — |

---

## Parte 2 — Centralización de tokens de estilo

### 2.1 — `config/colors.ts` ELIMINADO → fusionado en `config/scheme.ts`

`colors.ts` fue eliminado. Todo su contenido fue absorbido por `scheme.ts` que es ahora  
**la única fuente de verdad** para todos los tokens de estilo del proyecto (Tailwind classes + hex/rgba).

### 2.2 — Tokens añadidos a `config/scheme.ts`

| Export | Contenido | Consumidores |
|--------|-----------|-------------|
| `Z` | Jerarquía z-index: STICKY/POPOVER/DRAWER/MODAL/TOAST | Modal, ToastContainer, LogoutModal, NoteModal, NotificationBell, UserDrawer |
| `COLORS` | Hex/rgba por categoría de acción + actionFallback | AwardModal, ActionMapper |
| `AVATAR_PALETTE` | Paleta hex para hashColor() | lib/utils.ts |
| `BANNER_GRADIENT` | Gradiente de banner portal (admin view) | ProfileHeader |
| `HERO_BANNER` | 6 valores de gradiente del hero portal (student view) | PerfilTab |
| `TRAMOS` + `TramoId` | Niveles académicos con colores hex | PerfilTab |
| `TREND_HEX` | `{ up: '#4ade80', down: '#f87171' }` | PerfilTab Sparkline |
| `SEVERITY` + `SeverityKey` | Clases dot/border/text por severidad | NotificationItem |
| `STATUS_BADGE` + `StatusBadgeKey` | Clases Tailwind por estado de transacción | status-badge, DrawerTransactionsTab |
| `STATUS_LABEL` | Etiquetas legibles por estado | DrawerTransactionsTab |
| `COIN_SIGN` + `coinSignKey()` | Clases dot/text para delta de coins | RecentHistory |
| `TX_DIRECTION` + `TxDirectionKey` | Clases icono/texto para sent/received | TxHistory, DrawerTransactionsTab |
| `EFFECT_LEVEL` + `effectLevelKey()` | Clases bg/text para porcentaje de efecto | SliderField |
| `TOAST_SCHEME` | Clases bg/border/text por tipo de toast | ToastContainer |
| `STAT_CARD` + `StatCardColor` | Clases para tarjetas de estadísticas | ProfileHeader |
| `ACTION_CATEGORY` + fallback | Clases dot/text/bg/border por categoría | PerfilTab |
| `AWARD_MODE_STYLES` | Clases para botones de modo en AwardModal | AwardModal |
| `DEAL_THEMES` | Gradientes + accent hex para carrusel | DiscountCarousel |
| `PROGRESS_BAR` | Gradientes para barra de progreso de premios | RewardsProgress |

### 2.3 — Constantes locales eliminadas

| Archivo | Constante eliminada | Reemplazada por |
|---------|--------------------|--------------| 
| `features/portal/ui/PerfilTab.tsx` | `TRAMOS` local (7 items) | `TRAMOS` de scheme.ts |
| `features/portal/ui/PerfilTab.tsx` | 6 gradientes inline en `style=` | `HERO_BANNER.*` de scheme.ts |
| `features/portal/ui/PerfilTab.tsx` | `'#4ade80'` / `'#f87171'` inline | `TREND_HEX.up` / `.down` |
| `features/portal/ui/ProfileHeader.tsx` | `colors` map local en `StatCard` | `STAT_CARD` de scheme.ts |
| `features/portal/ui/ProfileHeader.tsx` | Gradientes inline en `style=` | `BANNER_GRADIENT.*` de scheme.ts |
| `features/portal/ui/TxHistory.tsx` | Clases sent/received inline | `TX_DIRECTION` de scheme.ts |
| `features/portal/ui/components/RewardsProgress.tsx` | Gradiente+shadow inline | `PROGRESS_BAR` de scheme.ts |
| `features/portal/ui/components/DiscountCarousel.tsx` | `DEAL_GRADIENTS` local | `DEAL_THEMES` de scheme.ts |
| `features/aula/ui/RecentHistory.tsx` | Ternarios de color inline | `COIN_SIGN[coinSignKey()]` |
| `features/aula/ui/AwardModal.tsx` | `MODE_ACTIVE_STYLES` local | `AWARD_MODE_STYLES` de scheme.ts |
| `features/aula/ui/AwardModal.tsx` | `{ bg: '#1e3a8a', text: '#bfdbfe' }` inline | `COLORS.actionFallback` |
| `features/acciones/application/mapper.ts` | `FALLBACK_COLOR` local | `COLORS.actionFallback` |
| `features/solicitudes/domain/types.ts` | `STATUS_LABEL` + `STATUS_CLASS` (sin consumidores) | Eliminados |
| `features/usuarios/domain/types.ts` | `TX_STATUS` local | `STATUS_BADGE` + `STATUS_LABEL` de scheme.ts |
| `lib/utils.ts` | `colors[]` inline en `hashColor()` | `AVATAR_PALETTE` de scheme.ts |

---

## Parte 3 — Eliminación de código duplicado y zombie

### 3.1 — Archivos eliminados

| Archivo | Motivo |
|---------|--------|
| `config/colors.ts` | Fusionado en scheme.ts — ya no existe como archivo separado |
| `components/shared/LogoutModal.tsx` | Era un `ConfirmDialog` con `variant="red"` — cero código único |
| `features/notifications/application/useInbox.ts` | Stub `export {}` — 0 consumidores, hook canónico en `hooks/useInbox.ts` |
| `features/portal/ui/Sparkline.tsx` (sesión anterior) | Duplicado de `portal/ui/components/Sparkline.tsx` |
| `features/portal/ui/TrajectoryChart.tsx` (sesión anterior) | Duplicado de `portal/ui/components/TrajectoryChart.tsx` |
| `features/notifications/ui/NotificationBell.tsx` (sesión anterior) | Stub `export {}` |
| `features/notifications/ui/NotificationBell_toDelete.tsx` (sesión anterior) | Implementación antigua |
| `features/notifications/ui/NotificationItem.tsx` (sesión anterior) | Stub `export {}` |
| `features/notifications/ui/NotificationItem_toDelete.tsx` (sesión anterior) | Implementación antigua |
| `features/notifications/ui/PushPrompt.tsx` (sesión anterior) | Stub `export {}` |
| `features/notifications/ui/PushPrompt_toDelete.tsx` (sesión anterior) | Implementación antigua |
| `components/ui/toast.tsx` (sesión anterior) | Orphan — 0 consumidores |

### 3.2 — Modales refactorizados (eliminación de markup duplicado)

| Modal | Antes | Después |
|-------|-------|---------|
| `LogoutModal` | 42 líneas con estructura `fixed/inset-0/backdrop` propia | Eliminado — reemplazado por `ConfirmDialog` en page.tsx |
| `NoteModal` | 49 líneas con estructura `fixed/inset-0/backdrop` propia | 38 líneas usando `<Modal>` base |

---

## Parte 4 — Corrección de z-index

Todos los valores z-index mágicos reemplazados por constantes del objeto `Z` en `scheme.ts`:

| Archivo | Antes | Después |
|---------|-------|---------|
| `components/ui/modal.tsx` | `z-[200]` | `style={{ zIndex: Z.MODAL }}` |
| `components/ui/toast-container.tsx` | `z-[600]` | `style={{ zIndex: Z.TOAST }}` |
| `components/ui/drawer.tsx` | `z-[var(--z-drawer)]` CSS var | Mantiene CSS var (válido) |
| `features/tienda/ui/NoteModal.tsx` | `z-[100]` | `style={{ zIndex: Z.DRAWER }}` |
| `components/shared/LogoutModal.tsx` | `z-[100]` | Eliminado (archivo eliminado) |
| `components/shared/NotificationBell.tsx` | `z-[300]` (fuera de jerarquía) | `style={{ zIndex: Z.POPOVER }}` |
| `features/usuarios/ui/UserDrawer.tsx` | `z-[400]` / `z-[401]` (fuera de jerarquía) | `Z.DRAWER` / `Z.DRAWER + 1` |

---

## Parte 5 — Categorización de componentes

### 5.1 — Archivos reubicados

| Archivo | Categoría anterior | Categoría correcta | Razón |
|---------|-------------------|--------------------|-------|
| `components/ui/status-badge.tsx` | `ui/` (átomo genérico) | `shared/` (tiene conocimiento de dominio: pending/approved/rejected) |
| `components/ui/toast-container.tsx` | `ui/` (átomo genérico) | `shared/` (stateful — lee Zustand store) |

`ui/index.ts` re-exporta ambos desde sus nuevas ubicaciones — **cero cambios en consumidores**.

### 5.2 — Barrel `components/shared/index.ts` (nuevo)

Agrupa todos los exports del directorio shared en categorías:
- Feedback / dialogs
- Form helpers
- Filters
- Layout / navigation
- Badges / indicators
- Notifications
- Providers

---

## Parte 6 — Fix CI: package-lock.json

**Problema:** `npm ci` fallaba en CI con `Missing: class-variance-authority@0.7.1 from lock file`.  
**Causa:** CVA fue instalado con `npm install` directamente en `web/` sin propagar al lock file raíz.  
**Fix:** `npm install --package-lock-only` en la raíz regeneró el lock file incluyendo la entrada de CVA.

---

## Verificación final

```
Backend:
  node_modules/.bin/vitest run --config api/vitest.config.ts
  → Test Files  28 passed (28)
  → Tests       145 passed (145)

Frontend:
  cd web && vitest run
  → Test Files  42 passed (42)
  → Tests       284 passed (284)

Build:
  next build   → ✓ Compiled successfully
  tsc --noEmit → exit 0
  next lint    → ✔ No ESLint warnings or errors
```

---

## Árbol de archivos modificados — sesión actual

```
cbt-control-aula/
├── package-lock.json                                    ← ACTUALIZADO (CVA + workspace sync)
├── docs/
│   └── CHANGELOG-2026-04-11.md                         ← ESTE ARCHIVO
├── web/src/
│   ├── config/
│   │   ├── colors.ts                                   ← ELIMINADO
│   │   └── scheme.ts                                   ← REESCRITO (único archivo de tokens)
│   ├── lib/utils.ts                                    ← MODIFICADO (AVATAR_PALETTE)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── index.ts                                ← MODIFICADO (re-exports)
│   │   │   ├── modal.tsx                               ← MODIFICADO (CVA size variant)
│   │   │   ├── button.tsx                              ← MODIFICADO (CVA)
│   │   │   ├── badge.tsx                               ← MODIFICADO (CVA)
│   │   │   ├── status-badge.tsx                        ← MOVIDO a shared/
│   │   │   └── toast-container.tsx                     ← MOVIDO a shared/
│   │   └── shared/
│   │       ├── index.ts                                ← NUEVO (barrel)
│   │       ├── status-badge.tsx                        ← MOVIDO desde ui/
│   │       ├── toast-container.tsx                     ← MOVIDO desde ui/
│   │       ├── LogoutModal.tsx                         ← ELIMINADO
│   │       ├── RankBadge.tsx                           ← NUEVO
│   │       ├── RewardMilestoneButton.tsx               ← NUEVO
│   │       ├── RewardTypeBadge.tsx                     ← NUEVO
│   │       ├── FilterPills.tsx                         ← MODIFICADO (CVA)
│   │       ├── NotificationBell.tsx                    ← MODIFICADO (Z.POPOVER)
│   │       └── NotificationItem.tsx                    ← MODIFICADO (SEVERITY)
│   └── features/
│       ├── acciones/application/mapper.ts              ← MODIFICADO (COLORS.actionFallback)
│       ├── aula/ui/
│       │   ├── AwardModal.tsx                          ← MODIFICADO (AWARD_MODE_STYLES, size="lg")
│       │   ├── StudentRanking.tsx                      ← MODIFICADO (RankBadge, RewardMilestoneButton)
│       │   └── RecentHistory.tsx                       ← MODIFICADO (COIN_SIGN)
│       ├── notifications/application/useInbox.ts       ← ELIMINADO (zombie stub)
│       ├── portal/ui/
│       │   ├── PerfilTab.tsx                           ← MODIFICADO (TRAMOS, HERO_BANNER, TREND_HEX)
│       │   ├── ProfileHeader.tsx                       ← MODIFICADO (BANNER_GRADIENT, STAT_CARD)
│       │   ├── TxHistory.tsx                           ← MODIFICADO (TX_DIRECTION)
│       │   └── components/
│       │       ├── DiscountCarousel.tsx                ← MODIFICADO (DEAL_THEMES)
│       │       └── RewardsProgress.tsx                 ← MODIFICADO (PROGRESS_BAR)
│       ├── recompensas/ui/RewardCard.tsx               ← MODIFICADO (RewardTypeBadge)
│       ├── solicitudes/domain/types.ts                 ← MODIFICADO (STATUS_CLASS/LABEL eliminados)
│       ├── tienda/ui/NoteModal.tsx                     ← MODIFICADO (usa Modal base, Z.DRAWER)
│       └── usuarios/
│           ├── domain/types.ts                         ← MODIFICADO (TX_STATUS eliminado)
│           └── ui/
│               ├── UserDrawer.tsx                      ← MODIFICADO (Z.DRAWER)
│               └── components/DrawerTransactionsTab.tsx ← MODIFICADO (STATUS_BADGE, TX_DIRECTION)
└── app/(public)/portal/page.tsx                        ← MODIFICADO (ConfirmDialog reemplaza LogoutModal)
```
