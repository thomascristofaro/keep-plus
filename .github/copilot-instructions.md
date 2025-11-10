# Keep+ AI Development Guide

## Project Overview
Keep+ is a React + TypeScript note-taking app using **Vite**, **Tailwind CSS v4**, and **IndexedDB** for local storage. The architecture is designed for easy migration to cloud providers (Firebase, Supabase) through a storage abstraction layer.

## Critical Architecture Patterns

### Storage Abstraction Layer
**DO NOT directly access IndexedDB** - always use the `ICardStorage` interface via `cardStorage` singleton from `storage-factory.ts`.

```typescript
// ✅ Correct - uses abstraction
import { cardStorage } from '@/services/storage-factory';
await cardStorage.createCard(newCard);

// ❌ Wrong - bypasses abstraction
const db = indexedDB.open('KeepPlusDB');
```

The storage layer follows this flow:
1. **UI Components** → `useCardStorage` hook
2. **Hook** → `cardStorage` singleton (from `storage-factory.ts`)
3. **Factory** → Concrete implementation (`IndexedDBCardStorage`)

All storage operations return `DatabaseResult<T>` with `{ success, data?, error? }`. See `STORAGE_ARCHITECTURE.md` for switching providers.

### State Management with React Router
- Routes drive modal state: `/note/:noteId` opens edit modal, `/tag/:tagName` filters by tag
- URL changes sync with app state via `useEffect` in `App.tsx`
- Modals don't use separate "new note" routes - `showAddModal` state handles creation
- **Always navigate on save/delete** to update URL:
  ```typescript
  await deleteCard(cardId);
  navigate(activeTag ? `/tag/${encodeURIComponent(activeTag)}` : '/');
  ```

### Auto-Save Pattern in AddCardModal
Cards auto-save on blur/change events - NO explicit save button:
- Title blur → `handleTitleBlur()` → `handleAutoSave()`
- Content blur → `handleContentBlur()` → `handleAutoSave()`
- Tag add/remove → immediate save via `setTimeout(handleAutoSave, 0)`

New cards get `id: Date.now()` as temporary ID until storage assigns real ID.

### Logging & Metrics
Use `logger` service for all console output:
```typescript
import { logger, trackAction } from '@/services/logger';
logger.info('Card created', { cardId, title }, 'AddCardModal');
trackAction('delete_card', { cardId });
```
Logs persist to localStorage. See `services/logger.ts` for page views, errors, and performance tracking.

## Component Structure

### Component Exports
All components use `index.ts` barrel exports:
```typescript
// components/Card/index.ts
export { default } from './Card';
// Usage:
import Card from './components/Card';
```

### Tailwind CSS v4 Usage
Using **CSS-first configuration** via `@theme` in `src/index.css`:
```css
@theme {
  --color-keep-yellow: #fbbc04;
}
```
Primary styling in `public/style.css` with extensive CSS custom properties. Dark mode via `data-color-scheme` attribute or `prefers-color-scheme`.

### Masonry Grid Layout
Cards use pure CSS columns (not JS library):
```css
.masonry-grid { column-count: 4; column-gap: 1rem; }
.masonry-item { break-inside: avoid; }
```
Responsive breakpoints: 2/3/4/5/6 columns. `.wide-card-mode` halves column count.

## Development Workflows

### Running the App
```powershell
npm run dev          # Vite dev server → http://localhost:5173
npm run build        # TypeScript check + production build
npm run preview      # Preview production build
npm run lint         # ESLint with react-hooks plugin
```

**Vite base path**: `/keep-plus/` - configured in `vite.config.ts` for GitHub Pages deployment.

### Type Definitions
Core types in `src/types/index.ts`:
```typescript
interface Card {
  id: number;                    // Auto-assigned by storage
  title: string;                 // Required
  coverUrl?: string;             // Optional, NOT stored in DB (cached locally)
  link?: string;                 // Source URL (triggers Instagram fetch)
  content?: string;              // Markdown/HTML
  tags: string[];                // Tag names, not objects
  createdAt: Date;
  updatedAt: Date;
}
```

### Instagram Integration
`utils/instagram.ts` auto-fetches cover images from Instagram URLs:
- Detects `instagram.com/p/` links
- Uses Instagram oEmbed API for `thumbnail_url`
- Triggered on link input blur in `AddCardModal`

## Common Pitfalls

1. **Cover images are cached, not stored**: Only `coverUrl` path/URL stored in DB, not image data
2. **Tags are strings, not objects**: `tags: string[]` not `Tag[]` with colors
3. **Modal routing**: Closing modal must navigate back to preserve URL state
4. **Selection mode**: `selectedCards: Set<number>` tracks IDs for bulk operations
5. **Dark mode**: Apply via `document.documentElement.classList.add('dark')`, not Tailwind's default `class` strategy

## Adding New Features

### New Storage Provider (e.g., Firebase)
1. Create `services/firebase-storage.ts` implementing `ICardStorage`
2. Update `storage-factory.ts` switch statement
3. Add provider type to `StorageProvider` union
4. No changes needed in components or hooks

### New Card Field
1. Update `Card` interface in `types/index.ts`
2. Modify `AddCardModal` form fields
3. Update `IndexedDBCardStorage` schema (increment `dbVersion`)
4. Storage handles migration automatically

### Selection/Bulk Actions
Reference `App.tsx` pattern:
- `selectionMode` boolean state
- `selectedCards: Set<number>` for IDs
- `handleSelectCard(cardId)` toggles selection
- `handleDeleteSelected()` iterates selected IDs

## Project-Specific Conventions

- **File extensions**: Always `.ts`/`.tsx` in imports (no auto-resolution)
- **Component naming**: PascalCase files match export (`Card.tsx` exports `Card`)
- **Hook naming**: Prefix with `use` (`useCardStorage`)
- **Service naming**: Kebab-case (`indexeddb-storage.ts`)
- **Import paths**: Relative paths, no `@/` aliases configured
- **Error boundaries**: `ErrorBoundary` component logs to `logger.trackErrorBoundary()`

## Testing Approach
Currently no test files. When adding tests:
- Use Vitest (Vite's test framework)
- Mock `cardStorage` for component tests
- Use in-memory storage provider for integration tests
