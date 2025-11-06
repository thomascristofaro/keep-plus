# Keep+
A simple stupid note app better than keep.

# IDEA
Card that have
```
┌─────────────────┐
│                 │ 
│  Cover          │ ← can be image uploaded or link*
│                 │
├─────────────────┤
│   Title         │ ← gotted by link or inserted
├─────────────────┤
│ Content         │ ← can be empty
├─────────────────┤
│ Tag             │ ← can be search by tag   
└─────────────────┘
```
\* If link is a social link (insta, pinterest or bambu) get the image, otherwise logo of link. (le cover non le salvi su db, al massimo in cache locale)

During the insert phase, must open a big card for the content part, it need to have a html editor (or directly in md editor? there is one?)

tag have to be selected from there existing tags or create a new one writing the name

TODO
* interface Card why different from CardFormData?
* when edit mode of card same for the new
* no more   type: 'link' | 'image'; -> to understand if mantain alse the url field
* description -> Content
