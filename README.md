# Grocery List

A reusable grocery checklist organized by store. It installs to the iPhone home
screen through Safari and works offline.

Built to replace a notes app checklist that gets ticked off during shopping and
cleared afterward, over and over. Nothing is deleted when you finish a trip. The
items stay and the checkmarks reset.

## What it does

- Pick who is shopping on the home screen. Each person keeps their own stores
  and items.
- Store tabs across the top, each showing how many items are still to get.
- Tap a row to check an item off. Checked items sink to the bottom, which can be
  turned off.
- Add an item, and if it is already on the list it gets unchecked rather than
  duplicated.
- An icon per item, picked from an emoji sheet in edit mode. Icons are shared by
  everyone, so the same item looks the same for each person. Most common
  groceries already have one.
- Edit mode for renaming, reordering, and deleting items.
- Whole trip view, showing every item still to get across all stores at once,
  grouped by store. Tapping a row checks it off in its real store list.
- Start new trip clears the checkmarks on one store. Uncheck every list clears
  them all.
- Undo on every destructive action.
- Add, rename, and delete stores and people.
- Back up and restore through a JSON file.

## Stack

Vanilla HTML, CSS, and JavaScript. No framework, no build step, no package
manager, no dependencies. Open the folder and edit the files.

## Files

```
index.html              app shell and markup
styles.css              styling, light and dark through prefers-color-scheme
app.js                  state, rendering, storage, all logic
manifest.webmanifest    home screen install metadata
sw.js                   service worker, cache first offline
icons/                  app icons
```

## Test locally

The service worker will not run from `file://`, so serve the folder over HTTP.

**Terminal**

```bash
python -m http.server 8080
```

Use `python3` if `python` is not on your path. Then open
`http://localhost:8080`.

**VS Code**

Install the Live Server extension, right click `index.html`, choose "Open with
Live Server".

**On your phone over local wifi**

Find your machine's local IP, then open `http://THAT_IP:8080` on your phone.

```bash
ipconfig                      # Windows, look for IPv4 Address
ipconfig getifaddr en0        # macOS
hostname -I                   # Linux
```

The service worker will not register over plain HTTP on a non-localhost address,
so the app will not go offline this way. Everything else works. Full offline
behavior needs HTTPS, which GitHub Pages provides.

## Deploy to GitHub Pages

1. Create a repository on GitHub. Public is required for free Pages.
2. Push this folder to it:

```bash
git init
git add .
git commit -m "Grocery list PWA"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

3. In the repo, open Settings, then Pages.
4. Under "Build and deployment", set Source to "Deploy from a branch", branch
   `main`, folder `/ (root)`. Save.
5. Wait about a minute. The app lands at
   `https://YOUR_USERNAME.github.io/YOUR_REPO/`.

Relative paths are used throughout, so serving from a repository subpath works
without changes.

## Install on iPhone

Open the Pages URL in Safari. Chrome and Firefox on iOS cannot install web apps.
Tap the share button, scroll down, tap "Add to Home Screen". The app then opens
full screen with no browser chrome.

Look for "Saved for offline use." at the bottom of the screen. That is the
service worker confirming it registered.

## Updating the app

After changing any file the app loads, bump the cache name in `sw.js`:

```js
var CACHE = "grocery-v5";
```

Raise the number and push. Without that bump, installed phones keep serving the
old cached files and the change looks like it did nothing.

New files also need adding to the `ASSETS` array in `sw.js`, or they will not be
available offline.

## Notes on data

Everything is stored in `localStorage` on the device, under the key
`grocery.v1`. Nothing is sent anywhere and there is no account.

Each device keeps its own copy. Two phones do not sync. Use "Back up to a file"
and "Restore from a file" in the menu to move data between them. Backups from
older versions of the app still restore, because they are upgraded on the way
in.

iOS clears `localStorage` for websites after about seven days of no use.
Installing to the home screen makes this much less likely, but back up
occasionally if the list matters.
