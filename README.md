# 🖐️ Jedi Scroll

Control your browser like a Jedi:

Use __hand gestures__ to scroll any webpage without touching your device.

## ✨ Features

- 👌 Pinch → Scroll __down__

- 👋 Wave (side to side) → Scroll __up__

- Works using your __webcam__ and __MediaPipe Hands__

- No installation — just a __bookmarklet__

## 🚀 How to Use

### 1. Enable Webcam Access
   
Make sure your browser has access to your webcam.
This script runs inside the browser — no data is stored or sent anywhere.

### 2. What Is a Bookmarklet?
A bookmarklet is a special bookmark that runs JavaScript on the current page.

Instead of opening a new site, it injects code into the site you're on.

### 3. How to Add the Jedi Scroll Bookmarklet

1. Bookmark any page in your browser

2. Edit the bookmark

3. Replace the URL with this:
   ```javascript
   javascript:(function(){  var s = document.createElement('script');  s.src = 'https://cdn.jsdelivr.net/gh/iam-weijie/jedi-scroll/gestureScroll.js';  document.body.appendChild(s);})();
   ```

## 🧠 Troubleshooting

- ❌ Doesn’t work on Chrome Web Store, Google, or other CSP-protected sites

- ✅ Works best on regular webpages (blogs, articles, projects)

- ✅ Works on desktop (not mobile)

## 🛠️ Credits

- Built using MediaPipe Hands

- Inspired by Jedi powers ✨
