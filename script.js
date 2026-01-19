const video = document.getElementById("video");
const blinkText = document.getElementById("blinkCount");

let blinkCount = 0;
let eyeClosed = false;

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream);

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const faceMesh = new FaceMesh({
  locateFile: file =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true
});

faceMesh.onResults(results => {
  if (!results.multiFaceLandmarks) return;

  const landmarks = results.multiFaceLandmarks[0];

  // Left eye landmarks
  const top = landmarks[159];
  const bottom = landmarks[145];

  const ear = distance(top, bottom);

  if (ear < 0.01 && !eyeClosed) {
    eyeClosed = true;
  }

  if (ear > 0.015 && eyeClosed) {
    blinkCount++;
    blinkText.innerText = blinkCount;
    eyeClosed = false;
  }
});

const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width: 480,
  height: 360
});

camera.start();
