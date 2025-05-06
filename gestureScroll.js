// Jedi Scroll - Hand gesture controlled scrolling
// This version is designed to be hosted online and loaded via a small bookmarklet

// Prevent multiple instances
if (window.JediScrollActive) {
  alert("Jedi Scroll is already running!");
} else {
  window.JediScrollActive = true;

  // Create status message box with improved styling
  const statusBox = document.createElement("div");
  statusBox.style.position = "fixed";
  statusBox.style.top = "10px";
  statusBox.style.left = "10px";
  statusBox.style.background = "rgba(0, 0, 0, 0.8)";
  statusBox.style.color = "white";
  statusBox.style.padding = "10px 15px";
  statusBox.style.borderRadius = "8px";
  statusBox.style.fontSize = "14px";
  statusBox.style.zIndex = 9999;
  statusBox.style.fontFamily = "sans-serif";
  statusBox.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  statusBox.style.transition = "opacity 0.3s";
  statusBox.innerText = "🔄 Jedi Scroll Loading...";
  document.body.appendChild(statusBox);

  // Function to show status with auto-hide
  function showStatus(msg, duration = 2000) {
    statusBox.innerText = msg;
    statusBox.style.opacity = "1";
    clearTimeout(showStatus.timeout);
    showStatus.timeout = setTimeout(() => {
      statusBox.style.opacity = "0.7";
      statusBox.innerText = "🖐 Jedi Scroll Ready";
    }, duration);
  }

  // Add keyboard shortcuts to toggle and control
  let isActive = true;
  let baseScrollSpeed = 30; // Default base speed

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      isActive = !isActive;
      showStatus(
        isActive ? "✅ Jedi Scroll Activated" : "⏸️ Jedi Scroll Paused"
      );
    } else if (e.key === "+") {
      // Increase sensitivity
      baseScrollSpeed += 10;
      showStatus(`🔼 Sensitivity increased: ${baseScrollSpeed}`, 1000);
    } else if (e.key === "-") {
      // Decrease sensitivity
      baseScrollSpeed = Math.max(10, baseScrollSpeed - 10);
      showStatus(`🔽 Sensitivity decreased: ${baseScrollSpeed}`, 1000);
    }
  });

  // Open palm detection with improved sensitivity
  function isOpenPalm(landmarks) {
    const wristY = landmarks[0].y;
    const indexFinger = landmarks[8].y;
    const middleFinger = landmarks[12].y;
    const ringFinger = landmarks[16].y;
    const pinky = landmarks[20].y;

    // All fingers must be extended (positioned above the wrist)
    return (
      indexFinger < wristY - 0.05 &&
      middleFinger < wristY - 0.05 &&
      ringFinger < wristY - 0.05 &&
      pinky < wristY - 0.05
    );
  }

  // Load MediaPipe scripts
  async function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  // Main initialization function
  async function init() {
    try {
      await loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"
      );
      await loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"
      );

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
        minDetectionConfidence: 0.5, // Lower for better responsiveness
        minTrackingConfidence: 0.5, // Lower for better continuity
      });

      let baselineY = null;
      let scrollDirection = 0;
      let lastScrollTime = 0;
      let scrollSpeed = 30; // Default speed

      hands.onResults((results) => {
        if (!isActive) return;

        if (results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];
          const fingertipY = landmarks[8].y; // Index fingertip

          // Check for open palm gesture to reset baseline
          if (isOpenPalm(landmarks)) {
            baselineY = fingertipY;
            showStatus("🔄 Baseline reset");
            return;
          }

          // Initialize baseline if not set
          if (baselineY === null) {
            baselineY = fingertipY;
            return;
          }

          const diff = fingertipY - baselineY;

          // Determine scroll direction and speed with continuous movement
          if (diff < -0.05) {
            // Scroll up - the further the finger, the faster
            scrollDirection = -1;
            scrollSpeed = Math.min(100, baseScrollSpeed + Math.abs(diff * 300));
          } else if (diff > 0.05) {
            // Scroll down - the further the finger, the faster
            scrollDirection = 1;
            scrollSpeed = Math.min(100, baseScrollSpeed + Math.abs(diff * 300));
          } else {
            scrollDirection = 0;
          }

          // Update status occasionally
          const now = Date.now();
          if (now - lastScrollTime > 500 && scrollDirection !== 0) {
            showStatus(
              scrollDirection === 1 ? "⬇️ Scrolling Down" : "⬆️ Scrolling Up",
              500
            );
            lastScrollTime = now;
          }
        } else {
          scrollDirection = 0;
        }
      });

      // Continuous smooth scrolling at more frequent intervals
      const scrollInterval = setInterval(() => {
        if (scrollDirection !== 0 && isActive) {
          window.scrollBy({
            top: scrollDirection * (scrollSpeed / 10),
            behavior: "auto",
          });
        }
      }, 16); // ~60fps for smoother scrolling

      // Cleanup function
      window.addEventListener("beforeunload", () => {
        clearInterval(scrollInterval);
      });

      // Initialize camera
      const camera = new Camera(video, {
        onFrame: async () => {
          await hands.send({ image: video });
        },
        width: 640,
        height: 480,
      });

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });
        video.srcObject = stream;
        video.play();
        camera.start();
        showStatus("✅ Jedi Scroll Ready! Open palm to calibrate", 3000);
      } catch (err) {
        showStatus("❌ Camera access denied or blocked");
        console.warn(err);
      }
    } catch (err) {
      showStatus("❌ Failed to load required libraries");
      console.error(err);
    }
  }

  // Start the application
  init();
}
