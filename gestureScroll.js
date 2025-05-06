(async () => {
  window.JediScrollActive = true;

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

  let scrollDirection = 0;

  hands.onResults((results) => {
    if (results.multiHandLandmarks.length > 0) {
      const y = results.multiHandLandmarks[0][8].y;
      // y value of the index finger tip (landmark 8)

      if (y < 0.35) {
        scrollDirection = -1; // scroll up
      } else if (y > 0.65) {
        scrollDirection = 1; // scroll down
      } else {
        scrollDirection = 0; // neutral zone = no scroll
      }
    } else {
      scrollDirection = 0; // no hand detected
    }
  });

  setInterval(() => {
    if (scrollDirection === 1) {
      window.scrollBy(0, 30);
    } else if (scrollDirection === -1) {
      window.scrollBy(0, -30);
    }
  }, 50); // scroll every 50ms

  const camera = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 640,
    height: 480,
  });

  try {
    await navigator.mediaDevices.getUserMedia({ video: true });
    camera.start();
  } catch (err) {
    alert("Camera access denied or blocked.");
    console.warn(err);
  }
})();
