# Insert New Card Flow in Keep+

This document describes the step-by-step flow for inserting (adding) a new card in the Keep+ app, based on the current codebase as of November 2025.

---

## 1. User Action: Open Add Card Modal
- The user clicks the 'Add Card' button in the UI.
- This sets `showAddModal` to `true` in `App.tsx`, opening the `AddCardModal` component.

## 2. Modal Initialization
- `AddCardModal` mounts and runs its `useEffect` to initialize state:
  - If editing an existing card, loads its data.
  - If adding a new card, resets all fields (`title`, `coverUrl`, `link`, `content`, `tags`) to empty/default values.

## 3. User Input & Auto-Save
- The user enters a title, cover image URL, link, content, and tags.
- **Auto-save pattern:**
  - On blur/change of title, content, or link, or when tags are added/removed, `handleAutoSave()` is triggered.
  - `handleAutoSave()` constructs a `Card` object (with a temporary `id: Date.now()` if new) and calls `onSave(card)`.
  - If the link is an Instagram URL, the app fetches a cover image using the Instagram oEmbed API.

## 4. Saving the Card
- In `App.tsx`, the `onSave` prop for `AddCardModal` is set to `handleAddCard` (for new cards).
- `handleAddCard` calls the `addCard` function from the `useCardStorage` hook.
- `addCard` calls `cardStorage.createCard(cardData)` (using the storage abstraction layer).
- The storage provider (e.g., `IndexedDBCardStorage`) assigns a real `id`, `createdAt`, and `updatedAt` timestamps, and persists the card.
- On success, the new card is added to the `cards` state and appears in the main view.

## 5. Modal Close & Navigation
- The modal can be closed by clicking outside, pressing the close button, or after a successful save.
- The app navigates as needed to update the URL and state.

---

## Key Files Involved
- `src/App.tsx` (modal state, addCard handler)
- `src/components/AddCardModal/AddCardModal.tsx` (modal UI, auto-save logic)
- `src/hooks/useCardStorage.ts` (storage hook, addCard logic)
- `src/services/storage-factory.ts` (storage abstraction)
- `src/services/indexeddb-storage.ts` (IndexedDB implementation)

---

## Notes
- All storage operations use the `ICardStorage` interface via the `cardStorage` singleton.
- There is **no explicit save button**; all saves are auto-triggered on user input events.
- Cover images from Instagram links are fetched automatically.
- Tags are stored as an array of strings.

---

For more details, see the code in the files listed above and the [AI Development Guide](../.github/copilot-instructions.md).
