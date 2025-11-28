# Keep+ Functional Brief (for Claude 4.5)

## Core Concept
Keep+ organizes Notes. Each note can have a title, optional content, optional source link, optional cover image, and one or more tag names. Notes appear in a scrollable masonry grid. Users can add, edit and delete cards. Users can filter by tag with the left menu and can search by title with the upper search bar. The app autosaves changes as users type or leave fields.

## Entities
- Note
  - Title: required text.
  - Content: optional long text.
  - Link: optional URL to a source
  - Cover Image: optional image shown on the card; set manually.
  - Tags: a list of tag names (simple strings); used for filtering.
  - Timestamps: created and updated times.

## Screen Inventory
- Home (Note Grid)
  - Shows all notes or the current tag-filtered set.
  - Supports selection mode for bulk removing.
  - Left menu for filtering by tag
  - Entry points: create new card, open card to edit.
- Note Card
  - Form for cover image, title, content, link, tags.
  - The Card is divided in 3 parts:
    - header: The title and the cover image behind
    - Body: content
    - footer: link and tags
  - Autosaves on blur/change.
  - create or edit a card

## User Journeys
1) Browse Notes
- The home screen shows notes in a multi-column masonry grid (two for mobile, more for tablet and desktop). Notes display title, optional cover image and optional link.
- Users can scroll to see more notes. Grid should feel light and fast.
- left menu for filter notes by tag
- upper bar with a search bar for search in notes by title

2) Create a Note
- From home, users click on + button to open the Note Card in creation mode
- The user enters a title (required). Content, link, and tags are optional.
- As soon as the user blurs a field or stops typing briefly, the app autosaves. There is no explicit save button.

3) Edit a Card
- Tapping a card opens the Note Card in edit view.
- Editing uses the same autosave behavior: changes are saved on blur/change without requiring a save button.
- Users can add/remove tags. Tag changes are saved immediately.

4) Filter by Tag
- From home, users can filter the list by selecting a tag from the left menu.
- The filtered view shows only notes containing that tag.
- Clicking in Home button from left menu, returns to the full list.

5) Select and Delete Multiple Notes
- Users can enter a selection mode from the home screen.
- Tapping notes toggles selection; a simple toolbar allows "Delete".
- Deleting removes the selected cards and returns to the home view (or the active tag view if filtering).

6) Delete a Single Card
- From the card options of the card edit view, users can delete a card.
- After deletion, the app returns to the previous list context (home or tag-filtered view).

## Screens and Routes
- `/`: Home grid list of cards; tag filter applied via search or chip.
- `/search=XXXX`: Searched list view.
- `/tag/[name]`: Filtered list view.
- `/note`: Create card.
- `/note/[id]`: Edit card.

## Behaviors and Rules
- Autosave: No Save button. The app saves when a field loses focus or after a short pause in typing.
- Tags: Tags are plain strings (e.g., "work", "ideas"). 
- Cover images: Store and display only a URL to an image. Load it only when open the app
- Navigation consistency: After save or delete, the user remains in a sensible context. Deleting from edit returns to the list; deleting in a tag view returns to that filtered list.
- Performance: Lists should render smoothly; avoid heavy visual effects.
- Dark mode: Support light/dark themes based on the system appearance.

## Non-Goals
- No rich tag management (no colors, no tag metadata beyond names).
- No complex formatting tools; a simple content field is sufficient.
- No explicit save/cancel flows; autosave handles persistence.

## Implementation Notes (For Reference Only)
- Use the target libraries listed above; they are suggestions to achieve the behaviors. Prioritize the functional rules.
- Data persistence should ensure cards are available across app launches.
- Log important actions (create, update, delete) minimally for diagnostics; do not expose logs to users.

## Target Stack
- Runtime: React Native + Expo (managed workflow).
- Navigation: Expo Router (file-based). Keep route-driven state semantics.
- UI: Gluestack UI for standard components; minimal custom styling.
- Data: Supabase JS SDK; Postgres schema with RLS. Avoid platform-specific native modules.
- State: Zustand for local UI state and cache.
