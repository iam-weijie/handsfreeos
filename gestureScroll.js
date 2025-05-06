(async () => {
  window.JediScrollActive = true;

  // ✊ Detect fist (fingers curled)
  function isFist(landmarks) {
    const fingers = [8, 12, 16, 20];
    return fingers.every((tip) => {
      const base = tip - 2;
      return Math.abs(landmarks[tip].y - landmarks[base].y) < 0.05;
    });
  }

  // 🖐️ Open palm
  function isOpenPalm(landmarks) {
    const wristY = landmarks[0].y;
    return [8, 12, 16, 20].every((tip) => landmarks[tip].y < wristY - 0.05);
  }

  // 👉 Pointing: index up, others down
  function isPointing(landmarks) {
    const indexUp = landmarks[8].y < landmarks[6].y - 0.03;
    const othersDown = [12, 16, 20].every(
      (tip) => landmarks[tip].y > landmarks[tip - 2].y - 0.01
    );
    return indexUp && othersDown;
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

  let scrollDirection = 0;

  hands.onResults((results) => {
    if (results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];

      if (isFist(landmarks)) {
        scrollDirection = 1;
      } else if (isPointing(landmarks)) {
        scrollDirection = -1;
      } else if (isOpenPalm(landmarks)) {
        scrollDirection = 0;
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
  }, 50);

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
