(async () => {
  const script = document.createElement("script");
  script.type = "module";
  script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
  document.head.appendChild(script);

  const video = document.createElement("video");
  video.style.display = "none";
  document.body.appendChild(video);

  const { Hands } = await import(
    "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"
  );
  const { Camera } = await import(
    "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
  );

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

  let lastY = null;
  let lastScrollTime = 0;

  hands.onResults((results) => {
    if (results.multiHandLandmarks.length > 0) {
      const y = results.multiHandLandmarks[0][0].y;
      const now = Date.now();
      if (lastY !== null && now - lastScrollTime > 200) {
        const diff = lastY - y;
        if (diff > 0.03) {
          window.scrollBy(0, -50); // scroll up
          lastScrollTime = now;
        } else if (diff < -0.03) {
          window.scrollBy(0, 50); // scroll down
          lastScrollTime = now;
        }
      }
      lastY = y;
    }
  });

  const camera = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 640,
    height: 480,
  });

  camera.start();
})();
