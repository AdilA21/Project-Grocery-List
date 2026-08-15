# Grocery List

A reusable grocery checklist organized by store. Installs to the iPhone home screen and works offline.

## Files

```
index.html              app shell
styles.css              visual styling, light and dark mode
app.js                  state, rendering, storage
manifest.webmanifest    home screen install metadata
sw.js                   service worker for offline use
icons/                  app icons
```

## Test locally

The service worker will not run from `file://`, so serve the folder over HTTP.

**VS Code**

Install the Live Server extension, right click `index.html`, choose "Open with Live Server".

**Terminal**

```bash
cd grocery
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

**Test on your phone over local wifi**

Find your Mac's local IP with `ipconfig getifaddr en0`, then open `http://THAT_IP:8080` on your phone. The service worker will not register over plain HTTP on a non-localhost address, but everything else works. Full offline behavior needs HTTPS, which GitHub Pages provides.

## Deploy to GitHub Pages

1. Create a new repository on GitHub. Public is required for free Pages.
2. Push this folder to it:

```bash
cd grocery
git init
git add .
git commit -m "Grocery list PWA"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

3. In the repo, go to Settings, then Pages.
4. Under "Build and deployment", set Source to "Deploy from a branch", branch `main`, folder `/ (root)`. Save.
5. Wait about a minute. Your app will be at `https://YOUR_USERNAME.github.io/YOUR_REPO/`.

## Install on iPhone

Open the Pages URL in Safari. Chrome and Firefox on iOS cannot install web apps. Tap the share button, scroll down, tap "Add to Home Screen". The app then opens full screen with no browser chrome.

## Updating the app

After pushing changes, bump the cache name in `sw.js`:

```js
var CACHE = "grocery-v2";
```

Without that bump, phones keep serving the old cached files.

## Notes on data

Everything is stored in `localStorage` on each device. Your phone and your wife's phone keep separate lists. Use "Back up to a file" and "Restore from a file" in the menu to move data between them.

iOS clears `localStorage` for websites after about seven days of no use. Installing to the home screen makes this much less likely, but back up occasionally if the list matters.
