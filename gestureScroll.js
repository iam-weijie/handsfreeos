(async () => {
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

  function getDistance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function isPinching(landmarks) {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    return getDistance(thumbTip, indexTip) < 0.035;
  }

  // Wave detection logic
  let lastXs = [];
  let lastPinchTime = 0;
  let lastWaveTime = 0;

  function detectWave(x) {
    lastXs.push(x);
    if (lastXs.length > 10) lastXs.shift();

    let swings = 0;
    for (let i = 1; i < lastXs.length - 1; i++) {
      const dir1 = lastXs[i] - lastXs[i - 1];
      const dir2 = lastXs[i + 1] - lastXs[i];
      if (dir1 * dir2 < 0 && Math.abs(dir1) > 0.02) {
        swings++;
      }
    }

    return swings >= 2;
  }

  hands.onResults((results) => {
    if (results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const indexX = landmarks[8].x;
      const now = Date.now();

      // 👌 Pinch to scroll down (once every 500ms)
      if (isPinching(landmarks) && now - lastPinchTime > 500) {
        window.scrollBy(0, 100);
        lastPinchTime = now;
      }

      // 👋 Wave to scroll up (once every 1000ms)
      if (detectWave(indexX) && now - lastWaveTime > 1000) {
        window.scrollBy(0, -100);
        lastWaveTime = now;
      }
    }
  });

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
    console.warn("Camera access denied or blocked.");
  }
})();
