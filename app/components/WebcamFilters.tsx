"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import * as tf from "@tensorflow/tfjs";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import "@mediapipe/face_mesh";
import Webcam from "react-webcam";

interface Photo {
  id: string;
  url: string;
  filterId: string;
  description?: string;
  createdAt: string;
}

interface Filter {
  id: string;
  name: string;
  category?: string;
}

interface WebcamFiltersProps {
  onPhotoCapture?: (photo: {
    id: string;
    url: string;
    filterId: string;
    description?: string;
    createdAt: string;
  }) => void;
}

// Helper function for Gaussian blur
function gaussianBlur(imageData: ImageData, radius: number) {
  const pixels = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const tmpPixels = new Uint8ClampedArray(pixels);

  // Calculate weights
  const weights = [];
  const sigma = radius / 2;
  const sigmaSq = sigma * sigma;
  const sigmaSqx2 = 2 * sigmaSq;
  const sigmaRoot = Math.sqrt(2 * Math.PI) * sigma;

  for (let i = -radius; i <= radius; i++) {
    weights.push(Math.exp(-(i * i) / sigmaSqx2) / sigmaRoot);
  }

  // Horizontal blur
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0,
        weightSum = 0;

      for (let i = -radius; i <= radius; i++) {
        const px = Math.min(Math.max(x + i, 0), width - 1);
        const idx = (y * width + px) * 4;
        const weight = weights[i + radius];

        r += pixels[idx] * weight;
        g += pixels[idx + 1] * weight;
        b += pixels[idx + 2] * weight;
        a += pixels[idx + 3] * weight;
        weightSum += weight;
      }

      const targetIdx = (y * width + x) * 4;
      tmpPixels[targetIdx] = r / weightSum;
      tmpPixels[targetIdx + 1] = g / weightSum;
      tmpPixels[targetIdx + 2] = b / weightSum;
      tmpPixels[targetIdx + 3] = a / weightSum;
    }
  }

  // Vertical blur
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0,
        weightSum = 0;

      for (let i = -radius; i <= radius; i++) {
        const py = Math.min(Math.max(y + i, 0), height - 1);
        const idx = (py * width + x) * 4;
        const weight = weights[i + radius];

        r += tmpPixels[idx] * weight;
        g += tmpPixels[idx + 1] * weight;
        b += tmpPixels[idx + 2] * weight;
        a += tmpPixels[idx + 3] * weight;
        weightSum += weight;
      }

      const targetIdx = (y * width + x) * 4;
      pixels[targetIdx] = r / weightSum;
      pixels[targetIdx + 1] = g / weightSum;
      pixels[targetIdx + 2] = b / weightSum;
      pixels[targetIdx + 3] = a / weightSum;
    }
  }
}

// Map filter names to their effects
const FILTER_EFFECTS: Record<
  string,
  (ctx: CanvasRenderingContext2D, width: number, height: number) => void
> = {
  Normal: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // No effect
  },
  "Black & White": (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }
    ctx.putImageData(imageData, 0, 0);
  },
  Disney: async (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Enhance colors
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Increase saturation and brightness
      data[i] = Math.min(255, r * 1.2); // Red
      data[i + 1] = Math.min(255, g * 1.2); // Green
      data[i + 2] = Math.min(255, b * 1.2); // Blue

      // Soften skin tones
      if (r > 95 && g > 40 && b > 20 && r > g && r > b) {
        data[i] = Math.min(255, r * 0.9);
        data[i + 1] = Math.min(255, g * 1.1);
        data[i + 2] = Math.min(255, b * 1.1);
      }
    }

    // Apply custom Gaussian blur
    gaussianBlur(imageData, 1);
    ctx.putImageData(imageData, 0, 0);
  },
  Anime: async (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Edge detection for anime-like lines
    const edgeData = new Uint8ClampedArray(data);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        // Sobel operator for edge detection
        const gx =
          -1 * data[idx - 4 - width * 4] +
          -2 * data[idx - 4] +
          -1 * data[idx - 4 + width * 4] +
          1 * data[idx + 4 - width * 4] +
          2 * data[idx + 4] +
          1 * data[idx + 4 + width * 4];

        const gy =
          -1 * data[idx - width * 4 - 4] +
          -2 * data[idx - width * 4] +
          -1 * data[idx - width * 4 + 4] +
          1 * data[idx + width * 4 - 4] +
          2 * data[idx + width * 4] +
          1 * data[idx + width * 4 + 4];

        const magnitude = Math.sqrt(gx * gx + gy * gy);

        // Create bold edges
        if (magnitude > 50) {
          edgeData[idx] = 0;
          edgeData[idx + 1] = 0;
          edgeData[idx + 2] = 0;
        } else {
          // Color quantization for cel-shading effect
          edgeData[idx] = Math.round(data[idx] / 32) * 32;
          edgeData[idx + 1] = Math.round(data[idx + 1] / 32) * 32;
          edgeData[idx + 2] = Math.round(data[idx + 2] / 32) * 32;
        }
      }
    }

    const newImageData = new ImageData(edgeData, width, height);
    ctx.putImageData(newImageData, 0, 0);
  },
  "Comic Hero": async (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Create comic book style effect
    for (let i = 0; i < data.length; i += 4) {
      // Enhance contrast and create bold colors
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Increase contrast
      const contrast = 1.5;
      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

      data[i] = factor * (r - 128) + 128; // Red
      data[i + 1] = factor * (g - 128) + 128; // Green
      data[i + 2] = factor * (b - 128) + 128; // Blue

      // Add halftone effect
      if (Math.floor(i / 4) % 4 === 0) {
        const brightness = (r + g + b) / 3;
        if (brightness < 128) {
          data[i] = data[i + 1] = data[i + 2] = 0;
        } else {
          data[i] = Math.min(255, r * 1.2);
          data[i + 1] = Math.min(255, g * 1.2);
          data[i + 2] = Math.min(255, b * 1.2);
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  },
  Pixar: async (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Create Pixar-like effect with enhanced colors and smooth shading
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Enhance colors
      data[i] = Math.min(255, r * 1.1); // Slight red boost
      data[i + 1] = Math.min(255, g * 1.15); // More green for vibrance
      data[i + 2] = Math.min(255, b * 1.1); // Slight blue boost

      // Soften shadows
      const brightness = (r + g + b) / 3;
      if (brightness < 100) {
        data[i] = Math.min(255, r * 1.2);
        data[i + 1] = Math.min(255, g * 1.2);
        data[i + 2] = Math.min(255, b * 1.2);
      }
    }

    // Apply custom Gaussian blur
    gaussianBlur(imageData, 0.5);
    ctx.putImageData(imageData, 0, 0);
  },
  Vintage: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      data[i] = r * 0.393 + g * 0.769 + b * 0.189;
      data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
      data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
    }
    ctx.putImageData(imageData, 0, 0);
  },
  Rainbow: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "rgba(255,0,0,0.2)");
    gradient.addColorStop(0.2, "rgba(255,165,0,0.2)");
    gradient.addColorStop(0.4, "rgba(255,255,0,0.2)");
    gradient.addColorStop(0.6, "rgba(0,128,0,0.2)");
    gradient.addColorStop(0.8, "rgba(0,0,255,0.2)");
    gradient.addColorStop(1, "rgba(238,130,238,0.2)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  },
  "Pixel Art": (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const pixelSize = 10;
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCanvas.width = width;
    tempCanvas.height = height;

    // Draw original image to temp canvas
    tempCtx.drawImage(ctx.canvas, 0, 0);

    // Clear original canvas
    ctx.clearRect(0, 0, width, height);

    // Pixelate
    for (let y = 0; y < height; y += pixelSize) {
      for (let x = 0; x < width; x += pixelSize) {
        const imageData = tempCtx.getImageData(x, y, 1, 1).data;
        ctx.fillStyle = `rgb(${imageData[0]},${imageData[1]},${imageData[2]})`;
        ctx.fillRect(x, y, pixelSize, pixelSize);
      }
    }
  },
  Cartoon: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Edge detection and color quantization
    for (let i = 0; i < data.length; i += 4) {
      // Color quantization
      data[i] = Math.round(data[i] / 32) * 32; // Red
      data[i + 1] = Math.round(data[i + 1] / 32) * 32; // Green
      data[i + 2] = Math.round(data[i + 2] / 32) * 32; // Blue

      // Edge detection
      if (i > 0 && i < data.length - 4) {
        const prevPixel = Math.abs(data[i] - data[i - 4]);
        if (prevPixel > 30) {
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  },
  "Oil Painting": (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const radius = 3;

    // Create a temporary canvas for the effect
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCtx.drawImage(ctx.canvas, 0, 0);

    // Apply oil painting effect
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        const i = (y * width + x) * 4;
        let r = 0,
          g = 0,
          b = 0;
        let count = 0;

        // Sample pixels in radius
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const sampleI = ((y + dy) * width + (x + dx)) * 4;
            r += data[sampleI];
            g += data[sampleI + 1];
            b += data[sampleI + 2];
            count++;
          }
        }

        // Average the colors
        data[i] = r / count;
        data[i + 1] = g / count;
        data[i + 2] = b / count;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  },
  "Comic Book": (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Color quantization and edge enhancement
    for (let i = 0; i < data.length; i += 4) {
      // Posterize colors
      data[i] = Math.round(data[i] / 64) * 64; // Red
      data[i + 1] = Math.round(data[i + 1] / 64) * 64; // Green
      data[i + 2] = Math.round(data[i + 2] / 64) * 64; // Blue

      // Enhance contrast
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (avg > 128) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      } else {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  },
  Neon: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Enhance colors and add glow effect
    for (let i = 0; i < data.length; i += 4) {
      // Boost colors
      data[i] = Math.min(255, data[i] * 1.5); // Red
      data[i + 1] = Math.min(255, data[i + 1] * 1.5); // Green
      data[i + 2] = Math.min(255, data[i + 2] * 1.5); // Blue

      // Add glow effect
      if (i > 0 && i < data.length - 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (brightness > 200) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  },
};

export default function WebcamFilters({ onPhotoCapture }: WebcamFiltersProps) {
  const { data: session } = useSession();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const response = await fetch("/api/filters");
      if (!response.ok) throw new Error("Failed to fetch filters");
      const data = await response.json();
      setFilters(data);
    } catch (error) {
      console.error("Error fetching filters:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeWebcam = async () => {
    try {
      // First, stop any existing tracks
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }

      // Request camera access with fallback options
      const stream = await navigator.mediaDevices
        .getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
            frameRate: { ideal: 30 },
          },
          audio: false,
        })
        .catch(async () => {
          // Fallback to basic constraints if detailed ones fail
          return await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        });

      if (!videoRef.current) return;

      videoRef.current.srcObject = stream;

      // Wait for video to be ready
      await new Promise((resolve, reject) => {
        if (!videoRef.current) return reject();
        videoRef.current.onloadedmetadata = resolve;
        videoRef.current.onerror = reject;
      });

      await videoRef.current.play();
      setIsWebcamActive(true);
      setError("");
      setRetryCount(0);
    } catch (err) {
      console.error("Webcam error:", err);
      if (err instanceof DOMException) {
        switch (err.name) {
          case "NotAllowedError":
            setError(
              "Camera access denied. Please allow camera access in your browser settings and refresh the page."
            );
            break;
          case "NotFoundError":
            setError(
              "No camera found. Please make sure your device has a working camera."
            );
            break;
          case "NotReadableError":
            setError(
              "Camera is in use by another application. Please close other apps using the camera."
            );
            break;
          case "AbortError":
            if (retryCount < 3) {
              setError("Camera initialization failed. Retrying...");
              setRetryCount((prev) => prev + 1);
              // Retry after a short delay
              setTimeout(() => {
                initializeWebcam();
              }, 1000);
            } else {
              setError(
                "Unable to access camera. Please refresh the page or try a different browser."
              );
            }
            break;
          default:
            setError(
              "Unable to access webcam. Please make sure you have granted permission."
            );
        }
      } else {
        setError("An unexpected error occurred. Please refresh the page.");
      }
    }
  };

  useEffect(() => {
    let animationFrame: number;

    const startVideoProcessing = () => {
      if (!videoRef.current || !canvasRef.current || !isWebcamActive) return;

      const processFrame = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // Draw the current video frame
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

          // Find the selected filter
          const filter = filters.find((f) => f.id === selectedFilter);
          if (filter && FILTER_EFFECTS[filter.name]) {
            FILTER_EFFECTS[filter.name](ctx, canvas.width, canvas.height);
          }
        }

        animationFrame = requestAnimationFrame(processFrame);
      };

      processFrame();
    };

    initializeWebcam().then(() => {
      if (isWebcamActive) {
        startVideoProcessing();
      }
    });

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [selectedFilter, isWebcamActive, filters]);

  const handleRetry = () => {
    setRetryCount(0);
    setError("");
    initializeWebcam();
  };

  const capture = useCallback(() => {
    if (webcamRef.current?.video) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setShowForm(true);
      }
    }
  }, []);

  const handleSave = async () => {
    if (!capturedImage || !selectedFilter) return;

    setCapturing(true);
    try {
      const formData = new FormData();
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      formData.append("image", blob, "webcam.jpg");
      formData.append("filterId", selectedFilter);
      if (description) {
        formData.append("description", description);
      }

      const response2 = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      if (!response2.ok) {
        throw new Error("Failed to save photo");
      }

      const photo = await response2.json();
      if (onPhotoCapture) {
        onPhotoCapture(photo);
      }

      setCapturedImage(null);
      setDescription("");
      setShowForm(false);
    } catch (error) {
      console.error("Error saving photo:", error);
      alert("Failed to save photo");
    } finally {
      setCapturing(false);
    }
  };

  const handleCancel = () => {
    setCapturedImage(null);
    setDescription("");
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-white/70 backdrop-blur-sm rounded-2xl border border-purple-100">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-green-500 mb-3">
            Fun Camera Filters
          </h2>

          {/* Filter Selection */}
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedFilter === filter.id
                    ? "bg-gradient-to-r from-purple-600 to-green-500 text-white shadow-md transform scale-105"
                    : "bg-white/50 text-gray-700 hover:bg-white hover:shadow-sm border border-purple-100"
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>

          {/* Webcam Preview */}
          <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 shadow-inner border border-purple-100">
            {!showForm ? (
              <>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    width: 640,
                    height: 480,
                    facingMode: "user",
                  }}
                  className="w-full h-full object-cover"
                  onUserMedia={() => {
                    if (webcamRef.current?.video) {
                      const video = webcamRef.current.video;
                      if (canvasRef.current) {
                        canvasRef.current.width = video.videoWidth;
                        canvasRef.current.height = video.videoHeight;
                        // Draw initial frame
                        const ctx = canvasRef.current.getContext("2d");
                        if (ctx) {
                          ctx.drawImage(
                            video,
                            0,
                            0,
                            canvasRef.current.width,
                            canvasRef.current.height
                          );
                        }
                      }
                    }
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ display: "none" }}
                />
                {selectedFilter && (
                  <button
                    onClick={capture}
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gradient-to-r from-purple-600 to-green-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center space-x-2 text-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>Take Photo</span>
                  </button>
                )}
              </>
            ) : (
              <div className="relative h-full">
                <img
                  src={capturedImage!}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <div className="bg-white rounded-xl p-4 max-w-sm w-full mx-4 shadow-xl">
                    <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-green-500 mb-3">
                      Add a Description
                    </h3>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a description for your photo (optional)"
                      className="w-full h-20 px-3 py-2 text-sm text-gray-900 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white/50"
                    />
                    <div className="flex justify-end space-x-3 mt-3">
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
                        disabled={capturing}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={capturing}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-green-500 text-white text-sm rounded-lg hover:from-purple-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
                      >
                        {capturing ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            <span>Saving...</span>
                          </div>
                        ) : (
                          "Save Photo"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-purple-50/50 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              How to Use
            </h3>
            <ul className="space-y-1.5 text-sm text-gray-600">
              <li>1. Allow camera access when prompted</li>
              <li>2. Choose a filter from the options above</li>
              <li>3. Try different filters to see fun effects!</li>
              <li>4. Click "Take Photo" to capture your photo</li>
              <li>5. Add an optional description to your photo</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-green-50/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <svg
                className="w-4 h-4 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-sm font-medium text-gray-700">Tips</h3>
            </div>
            <ul className="space-y-1.5 text-sm text-gray-600">
              <li>• Make sure you're in a well-lit area</li>
              <li>• Keep the camera steady for best results</li>
              <li>• Try different angles for creative shots</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
