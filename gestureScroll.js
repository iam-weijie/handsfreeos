(async () => {
  window.JediScrollActive = true;

  // 💬 Create status message box
  const statusBox = document.createElement("div");
  statusBox.style.position = "fixed";
  statusBox.style.top = "10px";
  statusBox.style.left = "10px";
  statusBox.style.background = "rgba(0, 0, 0, 0.7)";
  statusBox.style.color = "white";
  statusBox.style.padding = "8px 12px";
  statusBox.style.borderRadius = "8px";
  statusBox.style.fontSize = "14px";
  statusBox.style.zIndex = 9999;
  statusBox.style.fontFamily = "sans-serif";
  statusBox.innerText = "🖐 Jedi Scroll Ready";
  document.body.appendChild(statusBox);

  function showStatus(msg, duration = 1500) {
    statusBox.innerText = msg;
    clearTimeout(showStatus.timeout);
    showStatus.timeout = setTimeout(() => {
      statusBox.innerText = "🖐 Jedi Scroll Ready";
    }, duration);
  }

  // ✋ Open palm detection
  function isOpenPalm(landmarks) {
    const wristY = landmarks[0].y;
    const fingers = [8, 12, 16, 20];
    return fingers.every((tip) => landmarks[tip].y < wristY - 0.05);
  }

  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
  document.body.appendChild(script);
  await new Promise((resolve) => (script.onload = resolve));

  const cameraScript = document.createElement("script");
  cameraScript.src =
    "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
  document.body.appendChild(cameraScript);
  await new Promise((resolve) => (cameraScript.onload = resolve));

  const video = document.createElement("video");
  video.style.display = "none";
  document.body.appendChild(video);

  const hands = new Hands({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
  });

  let baselineY = null;
  let scrollDirection = 0;

  hands.onResults((results) => {
    if (results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const fingertipY = landmarks[8].y;

      if (isOpenPalm(landmarks)) {
        baselineY = fingertipY;
        showStatus("🔄 Baseline reset");
        return;
      }

      if (baselineY === null) {
        baselineY = fingertipY;
        return;
      }

      const diff = fingertipY - baselineY;

      if (diff < -0.05) {
        scrollDirection = -1;
      } else if (diff > 0.05) {
        scrollDirection = 1;
      } else {
        scrollDirection = 0;
      }
    } else {
      scrollDirection = 0;
    }
  });

  setInterval(() => {
    if (scrollDirection === 1) window.scrollBy(0, 30);
    else if (scrollDirection === -1) window.scrollBy(0, -30);
  }, 50); // scroll every 50ms

  const camera = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 640,
    height: 480,
  });

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.play();
    camera.start();
  } catch (err) {
    alert("Camera access denied or blocked.");
    console.warn(err);
  }
})();
