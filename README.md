# 🖐️ Jedi Scroll

Control your browser like a Jedi:

Use **hand gestures** to scroll any webpage without touching your device.

## ✨ Features

- 👌 Pinch → Scroll **down**

- 👋 Wave (side to side) → Scroll **up**

- Works using your **webcam** and **MediaPipe Hands**

- No installation — just a **bookmarklet**

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
   javascript: (() => {
     const s = document.createElement("script");
     s.src = "https://iam-weijie.github.io/jedi-scroll/gestureScroll.js";
     document.body.appendChild(s);
   })();
   ```

## 🧠 Troubleshooting

- ❌ Doesn’t work on Chrome Web Store, Google, or other CSP-protected sites

- ✅ Works best on regular webpages (blogs, articles, projects)

- ✅ Works on desktop (not mobile)

## 🛠️ Credits

- Built using [MediaPipe Hands](https://github.com/google-ai-edge/mediapipe/blob/master/docs/solutions/hands.md)

- Inspired by Jedi powers ✨

## 💥 Follow for more _Weijie's Tech Fails_

Follow me for more side projects, and occasional magic tricks with code ✨

- [Instagram](https://www.instagram.com/iam._.weijie/)

- [TikTok](https://www.tiktok.com/@iam._.weijie)

- [Youtube](https://www.youtube.com/@iam_weijie)

- [LinkedIn](https://www.linkedin.com/in/weijiew/)
