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

  function isPointing(landmarks) {
    const indexUp = landmarks[8].y < landmarks[6].y - 0.03;
    const othersDown = [12, 16, 20].every(
      (tip) => landmarks[tip].y > landmarks[tip - 2].y - 0.01
    );
    return indexUp && othersDown;
  }

  hands.onResults((results) => {
    if (results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];

      const isPinchingGesture = isPinching(landmarks);
      const isPointingGesture = isPointing(landmarks);

      if (isPinchingGesture) {
        window.scrollBy(0, 50); // scroll down
      } else if (isPointingGesture) {
        window.scrollBy(0, -50); // scroll up
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
