
# Keep+

Keep+ is a simple, intuitive note-taking app designed to be more effective and user-friendly than Google Keep. It allows you to organize your thoughts, bookmarks, and ideas using customizable cards, tags, and rich content editing.

## Card Structure
Each card in Keep+ consists of the following elements:

```
┌─────────────────────────────┐
│         Cover Image         │ ← Upload an image or provide a link*
├─────────────────────────────┤
│           Title             │ ← Auto-fetched from link or entered manually
├─────────────────────────────┤
│          Content            │ ← Rich text or markdown, can be empty
├─────────────────────────────┤
│            Tags             │ ← Select from existing or create new
└─────────────────────────────┘
```

*If the link is to a social site (Instagram, Pinterest, Bambu), the app fetches the preview image. For other links, it uses the site's logo. Cover images data are cached locally, not stored in the database, only link/path are stored.*

## Features & Concepts
- **Rich Content Editing:** When adding or editing a card, a large editor is provided for the content. You can use HTML or Markdown for formatting.
- **Tag Management:** Tags help organize cards. You can select from existing tags or create new ones by typing a name.
- **Smart Cover Handling:** Covers are fetched intelligently based on the link type, improving visual organization.

---

## Card Structure

Card {
  id: number; // Unique identifier
  title: string;
  coverUrl?: string; // Optional: URL or local path to cover image
  link?: string; // Optional: original link for cover/title
  content?: string; // Optional: Rich text or markdown
  tags: string[]; // Array of tag name
  createdAt: Date;
  updatedAt: Date;
}

## Card Workflow

### Adding a Card
1. **Click 'Add Card':** Opens a modal or dedicated area for card creation.
2. **Set Cover:** Upload an image or paste a link. The app will fetch a preview or logo as needed.
3. **Enter Title:** The title is auto-filled if a link is provided, or you can type your own.
4. **Edit Content:** Use the rich editor to add notes, links, or any formatted text. Content is optional.
5. **Assign Tags:** Choose from existing tags or create a new one by typing and pressing enter.
6. **Auto Saved** The card is added to your collection automatically after the first insert field and visible in the main view.

### Editing a Card
1. **Select a Card:** Click on any card to open it in edit mode.
2. **Modify Details:** Change the cover, title, content, or tags as needed. The editor is the same as for adding a card.
3. **Auto Save Changes:** Updates are reflected immediately in your collection.

### Deleting a Card
1. **Select a Card:** Click on the card you wish to delete.
2. **Delete Action:** Click the delete button/icon. A confirmation prompt may appear to prevent accidental deletion.
3. **Confirm:** The card is removed from your collection and storage.

---

## Technical Notes
- **Cover Images:** Not stored in the database, only cached locally for performance.
- **Tags:** Flexible, allowing both selection and creation on the fly.
- **Content Editor:** Supports both HTML and Markdown for rich note-taking.

---

## Development TODOs
- Edit `Card` structure based on the information written here
- Unify `Card` and `CardFormData` interfaces for consistency.
- Ensure edit mode uses the same UI as add mode for cards.
- now change for the UI point of view, how card are showed: 
- in mobile view: 2 columns
- cards are with a square cover if they have the coverurl set, then the title, no content, link logo if there is and then the tags if there are.
- click on card -> edit mode
- click on link logo -> open link
- for create a new card -> button
- little flag for selecting more cards -> button for delete selected
- in edit mode button for deleting
- adjust the height of the left menu, at the moment it seems has a fixed height, it must have the height of the display

---

## Getting Started
1. Clone the repository.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## License
MIT
