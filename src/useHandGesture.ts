import { useEffect, useRef } from 'react';
import { FilesetResolver, HandLandmarker } from '@google/mediapipe-tasks-vision';

export const useHandGesture = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const gestureState = useRef<{ progress: number; target: number; pointer: [number, number] }>({
    progress: 0, // 0 = FORMED, 1 = CHAOS
    target: 0,
    pointer: [0, 0]
  });
  
  const landmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    async function initMediaPipe() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@google/mediapipe-tasks-vision@0.10.8/wasm"
      );
      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker_full/float16/1/hand_landmarker_full.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
      });
      landmarkerRef.current = handLandmarker;
      
      if (navigator.mediaDevices?.getUserMedia && videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', predictWebcam);
      }
    }

    let lastVideoTime = -1;
    function predictWebcam() {
      if (!videoRef.current || !landmarkerRef.current) return;
      const startTimeMs = performance.now();
      
      if (videoRef.current.currentTime !== lastVideoTime) {
        lastVideoTime = videoRef.current.currentTime;
        const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
        
        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          // 计算大拇指指尖(4)与小指指尖(20)的欧氏距离来粗略判断张开/闭合
          const p4 = landmarks[4];
          const p20 = landmarks[20];
          const distance = Math.sqrt((p4.x - p20.x)**2 + (p4.y - p20.y)**2 + (p4.z - p20.z)**2);
          
          // 手势判定：张开为 CHAOS (1)，闭合为 FORMED (0)
          gestureState.current.target = distance > 0.4 ? 1 : 0;
          
          // 食指指尖(8)作为视角控制摇杆
          const p8 = landmarks[8];
          gestureState.current.pointer = [(p8.x - 0.5) * 2, -(p8.y - 0.5) * 2];
        }
      }
      requestAnimationFrame(predictWebcam);
    }

    initMediaPipe();
  }, [videoRef]);

  return gestureState;
};

