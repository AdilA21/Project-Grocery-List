# Grocery List PWA

## What this is

A personal grocery checklist app for Adil and his wife. It replaces a manually
maintained Apple Notes checklist that gets checked off during shopping and
unchecked afterward, on repeat.

It is a progressive web app, not a native iOS app. It installs to the iPhone
home screen through Safari and runs offline. The native Swift route was
considered and deferred, because it requires a Mac running a current macOS and
either weekly re-signing with a free Apple ID or a paid developer account.

## Stack

Vanilla HTML, CSS, and JavaScript. No framework, no build step, no package
manager, no dependencies. Open the folder and edit the files directly.

This is deliberate. Keep it that way unless there is a strong reason to change.
Do not introduce React, a bundler, TypeScript, or npm without asking first.

## Files

```
index.html              app shell and all markup
styles.css              all styling, light and dark mode via prefers-color-scheme
app.js                  state, rendering, storage, all logic in one IIFE
manifest.webmanifest    home screen install metadata
sw.js                   service worker, cache-first offline
icons/                  generated PNG icons
README.md               local testing and GitHub Pages deploy steps
```

## Data model

Everything lives in `localStorage` under the key `grocery.v1`. The key name is
frozen so live data is never orphaned. The shape inside it carries its own
`version` and is upgraded by `migrate()`.

```js
{
  version: 2,
  activeUserId: "custom",
  settings: { sinkChecked: true },
  icons: { "milk": "🥛" },
  users: [
    {
      id: "custom",
      name: "Custom",
      activeListId: "costco",
      lists: [
        {
          id: "costco",
          name: "Costco",
          items: [ { id: "iabc123", text: "Milk", checked: false } ]
        }
      ]
    }
  ]
}
```

Version 1 kept a single `lists` array at the top level. `migrate()` wraps it in
a user named Custom, keeping every store, item, checked state, and the chosen
`activeListId`. It runs on load and on restore from a backup file, so old
backups still work. The upgraded shape is written back immediately rather than
waiting for the first edit.

`icons` is shared by every user, keyed by the lowercased item name. A name with
no entry falls back to the `DEFAULT_ICONS` table, which tries the plural both
ways, dropping one letter for pickles and two for potatoes.

Seeded lists are Costco, Lotte, Walmart, Fresh Market, and Everything.
Everything holds the recurring items bought most trips regardless of store, so
it sits last, after the real shops. `SEED_LISTS` only applies on first run or if
stored data is missing or malformed.

## Current features

- Home screen where you pick who is shopping, each person with their own stores
  and items. It is the landing screen every launch, so a shared phone never
  opens straight into somebody else's list. The picker is a dropdown holding the
  last person used, centred over a soft gradient of the app greens. Tap a person
  to open their lists, the back arrow returns. Add people below the dropdown,
  rename and delete them through Edit people, which opens the list to reach
  them.
- An icon per item, picked from an emoji sheet in edit mode. Icons live in one
  shared map keyed by item name, so Milk looks the same for everyone. Items
  with no pick fall back to a built in table, which covers most of the seeded
  list out of the box.
- Store tabs with a count of unchecked items per store
- Tap a row to check off
- Checked items sink to the bottom, toggleable in the menu
- Add item, with duplicate detection that unchecks the existing row instead
- Edit mode with rename, move up, move down, and delete
- Start new trip unchecks the current list
- Uncheck every list resets all of them
- Undo toast on every destructive action
- Add, rename, and delete stores
- Backup and restore through a JSON file, which is how data moves between phones
- Whole trip view, showing every unchecked item across all stores, grouped by
  store. The header button next to the menu toggles it. Tapping a row checks the
  item off in its real store list. Rows checked during the visit stay on screen
  with a strikethrough until you leave. Tabs, the add bar, and the foot buttons
  hide, because they all act on one store. Rename and delete store grey out for
  the same reason. The view is not saved, so the app always opens on one store.

## Rules

**Bump the service worker cache after any change to the app shell.** Edit the
`CACHE` constant in `sw.js` from `grocery-v1` to `grocery-v2` and so on. Without
this, installed phones keep serving the old cached files and changes appear to
have no effect. This is the single easiest thing to forget.

**Add new files to the `ASSETS` array in `sw.js`** or they will not be available
offline.

**Preserve existing user data.** Anything stored under `grocery.v1` is a real
list in active use. If the shape of the data needs to change, write a migration
that reads the old shape and upgrades it. Do not silently reset to `SEED`.

**Test at 390px wide.** This is used on an iPhone while walking around a store.
Tap targets stay at 44px minimum. Font size on inputs stays at 16px or larger,
because anything smaller makes iOS Safari zoom on focus. Input styling is keyed
off `.compose input` rather than an id, so a new input cannot miss the rule.

**Outline icons need `class="stroked"` and nothing narrower.** The rule is a
bare `svg.stroked`, not scoped to a parent. An SVG built from `polyline` or
`path` with no fill override renders as a solid blob instead of a line, which is
how the dropdown chevron first shipped as a filled triangle.

**Any rule that sets `display` beats the `hidden` attribute.** The browser's own
`[hidden] { display: none }` loses to a class, which once left an empty toast
permanently on screen swallowing taps. `styles.css` now forces `[hidden]` with
`!important`. Leave that rule alone.

**Keep it accessible.** Buttons need `aria-label` when they have no text.
Interactive elements need visible focus states.

## Deployment

Pushed to GitHub Pages from the `main` branch, root folder. HTTPS is required
for the service worker to register, which is why Pages is used rather than local
hosting. Installed on iPhone through Safari, share sheet, Add to Home Screen.
Chrome on iOS cannot install web apps.

## Local testing

Serve over HTTP, because service workers do not run from `file://`.

```bash
python3 -m http.server 8080
```

Or use the Live Server extension in VS Code.

## Style preferences

Write in active voice with short sentences. Avoid em dashes, semicolons, and
filler language. In UI copy, use sentence case, name things by what the user
does rather than how the code works, and skip words like "successfully" and
"please".

## Ideas not yet built

- Quantities per item
- A recently removed list for re-adding occasional purchases
- Drag to reorder, currently handled with up and down arrows
- Sync between two phones, currently manual through backup files
