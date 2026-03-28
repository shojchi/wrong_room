import { ObjectDetector, FilesetResolver } from '@mediapipe/tasks-vision';

let detector: ObjectDetector | null = null;
let isInitializing = false;

export async function initializeObjectDetector(): Promise<ObjectDetector> {
  if (detector) return detector;
  if (isInitializing) {
    // Basic polling wait if multiple callers try to init at once
    while (isInitializing) {
      await new Promise(r => setTimeout(r, 100));
    }
    return detector!;
  }
  
  isInitializing = true;
  try {
    // It's dramatically more reliable to load MediaPipe WASM from CDN 
    // when using Vite, to prevent internal bundler crashes.
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm"
    );
    
    detector = await ObjectDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
        // Fallback to CPU if GPU gets tricky, but GPU usually works fine in browsers
        delegate: "GPU"
      },
      scoreThreshold: 0.55, // Don't want too many false positives
      runningMode: "VIDEO", // We are processing a streaming webcam
      maxResults: 3
    });
    
    return detector;
  } finally {
    isInitializing = false;
  }
}

export function getDetector(): ObjectDetector | null {
  return detector;
}
