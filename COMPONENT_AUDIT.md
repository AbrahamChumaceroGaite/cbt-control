# Component Audit — cbt-control-aula/web

Inventario de componentes reutilizables: los ya creados, los que aún faltan, y dónde reemplazar duplicación existente.

---

## 1. Componentes UI Atómicos (`components/ui/`)

| Componente | Archivo | Estado |
|---|---|---|
| `Button` | `button.tsx` | ✅ En uso |
| `Input` | `input.tsx` | ✅ En uso |
| `Label` | `label.tsx` | ✅ En uso |
| `Modal` | `modal.tsx` | ✅ En uso |
| `Select` | `select.tsx` | ✅ En uso |
| `Tooltip` | `tooltip.tsx` | ✅ En uso |
| `Badge` | `badge.tsx` | ✅ En uso |
| `Toast` | `toast.tsx` | ✅ En uso |
| `Skeleton` | `skeleton.tsx` | ⚠️ Creado, poco usado (ver §3) |
| `EmptyState` | `empty-state.tsx` | ⚠️ Creado, poco usado (ver §3) |
| `StatusBadge` | `status-badge.tsx` | ✅ Creado, en uso en TransaccionesSection, BankTab, SolicitudesTab |
| `SearchInput` | `search-input.tsx` | ✅ Creado, en uso en RecompensasTab, SolicitudesTab |
| `Checkbox` | `checkbox.tsx` | ✅ En uso |
| `Textarea` | `textarea.tsx` | ✅ En uso |

---

## 2. Componentes Shared Compuestos (`components/shared/`)

| Componente | Archivo | Usado en | Estado |
|---|---|---|---|
| `SectionHeader` | `SectionHeader.tsx` | AccionesSection, EstudiantesSection, CursosSection, GruposSection, RecompensasSection | ✅ Bien usado |
| `CardActions` | `CardActions.tsx` | AccionesSection, CursosSection, GruposSection, RecompensasSection | ✅ Bien usado |
| `Pagination` | `Pagination.tsx` | AccionesSection, EstudiantesSection, CursosSection, GruposSection, RecompensasSection | ✅ Bien usado |
| `ConfirmDialog` | `ConfirmDialog.tsx` | AccionesSection, CursosSection, EstudiantesSection, GruposSection, RecompensasSection, UserDrawer, SolicitudesTab | ✅ Creado, aplicado |
| `CourseSelect` | `CourseSelect.tsx` | EstudiantesSection, GruposSection, BankTab | ✅ En uso |
| `FilterPills` | `FilterPills.tsx` | BankTab, SolicitudesTab, TransaccionesSection | ✅ Creado, aplicado |
| `FloatingNav` | `FloatingNav.tsx` | Portal page | ✅ En uso |
| `LogoutModal` | `LogoutModal.tsx` | Admin page | ✅ En uso |

---

## 3. Patrones Duplicados Pendientes de Resolver

### 3.1 Filter Dropdown Popover (ALTA prioridad — ~350 LOC duplicados)

**Problema:** Los 4 `FilterButton` inline en features de admin son prácticamente idénticos: botón con icono `SlidersHorizontal`, popover con `ChevronDown`, badge activo, botón "Limpiar", controles internos.

**Archivos afectados:**
- `features/acciones/AccionesSection.tsx` — filtros Categoría + Estado + Rango de puntos
- `features/estudiantes/EstudiantesSection.tsx` — filtro rango de Coins (sliders)
- `features/recompensas/RecompensasSection.tsx` — filtros Tipo + Estado

**Solución propuesta:** `components/shared/FilterPopover.tsx`
```tsx
<FilterPopover label="Filtros" active={filtersActive} onClear={handleClear}>
  {/* children: selects, sliders, etc. */}
</FilterPopover>
```
- Props: `active: boolean`, `onClear: () => void`, `children: ReactNode`
- Encapsula: el botón, el icono, el badge de punto ámbar, el chevron animado, el panel flotante con z-200

**Impacto:** Elimina ~100 LOC de JSX repetido en cada feature, unifica el estilo visual de todos los filtros.

---

### 3.2 Skeleton / Loading States (MEDIA prioridad)

**Problema:** Hay divs de `animate-pulse` inline en varios lugares en lugar de usar el `Skeleton` existente.

**Archivos afectados:**
- `features/usuarios/UserDrawer.tsx` — skeleton del drawer al cargar historial de notificaciones y transacciones
- `features/tienda/TransaccionesSection.tsx` — posibles estados de carga
- `features/portal/PortalSkeleton.tsx` — ya extrae correctamente el skeleton del portal

**Solución:** Usar `<Skeleton className="h-N w-N" />` del componente existente en lugar de `<div className="animate-pulse ...">`.

---

### 3.3 EmptyState (MEDIA prioridad)

**Problema:** Hay textos de "no hay X" inline con estilos distintos en lugar de usar el `EmptyState` existente.

**Archivos afectados:**
- `features/cursos/CursosSection.tsx` — `<div className="col-span-full text-center py-12 text-zinc-500">No hay cursos creados.</div>`
- `features/grupos/GruposSection.tsx` — `<div className="col-span-full text-center py-12 text-zinc-500">No hay grupos creados en este curso.</div>`
- `features/portal/SolicitudesTab.tsx` — estado vacío de solicitudes
- `features/portal/BankTab.tsx` — estado vacío del historial de transacciones
- `features/solicitudes/SolicitudesSection.tsx` — `<div className="text-center py-16 text-zinc-600">No hay solicitudes...</div>`

**Solución:**
```tsx
<EmptyState
  icon={<BookType className="w-5 h-5" />}
  title="No hay cursos creados"
  description="Crea el primer curso para comenzar."
/>
```

---

### 3.4 Avatar con Iniciales (BAJA prioridad)

**Problema:** El patrón de avatar circular con iniciales del nombre aparece en al menos 3 lugares con estilos distintos.

**Archivos afectados:**
- `features/usuarios/UserDrawer.tsx` — avatar del usuario en el header del drawer
- `features/portal/ProfileHeader.tsx` — avatar en el portal del alumno
- `features/portal/BankTab.tsx` — avatar del destinatario seleccionado

**Solución propuesta:** `components/ui/avatar.tsx`
```tsx
<Avatar name="Juan Pérez" size="lg" />
```
- Genera iniciales automáticamente (primeras letras de cada palabra)
- Sizes: `sm` (w-8), `md` (w-10), `lg` (w-16)
- Color de fondo derivado del nombre (hash)

---

### 3.5 `SolicitudesSection` — Status Badge inline (BAJA prioridad)

**Problema:** `features/solicitudes/SolicitudesSection.tsx:67-73` tiene un ternario manual para el badge de estado (`pending/approved/rejected`) en lugar de usar `StatusBadge`.

**Solución:** Importar y usar `<StatusBadge status={s.status} variant="request" />`.

---

### 3.6 `SolicitudesSection` — Filtro con Buttons en lugar de FilterPills (BAJA prioridad)

**Problema:** Los botones "Pendientes / Todas" en `SolicitudesSection.tsx:50-52` usan `Button` con variant toggling, pero el mismo patrón semántico ya está cubierto por `FilterPills`.

**Solución:** Usar `<FilterPills options={[...]} value={filter} onChange={setFilter} />`.

---

## 4. Resumen de Acciones

| Prioridad | Tarea | LOC ahorradas |
|---|---|---|
| ✅ Hecho | `ConfirmDialog` — reemplaza 6x `window.confirm()` y modales inline | ~200 |
| ✅ Hecho | `StatusBadge` — reemplaza ternarios de estado en 3 features | ~60 |
| ✅ Hecho | `FilterPills` — reemplaza botones de filtro en 3 features | ~80 |
| ✅ Hecho | `SearchInput` — reemplaza inputs de búsqueda inline en 2 tabs | ~30 |
| 🔴 Pendiente | `FilterPopover` — envuelve los 3 FilterButton de admin | ~300 |
| 🟡 Pendiente | `EmptyState` — reemplaza 5x divs "no hay X" inline | ~30 |
| 🟡 Pendiente | `Skeleton` — usar el existente en drawers y secciones con carga | ~20 |
| 🟢 Pendiente | `Avatar` — unificar patrón de iniciales en 3 lugares | ~40 |
| 🟢 Pendiente | `SolicitudesSection` — `StatusBadge` + `FilterPills` | ~40 |
