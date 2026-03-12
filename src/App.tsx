import { useEffect, useRef, useState } from "react";
import { ShaderGradient, ShaderGradientCanvas } from "shadergradient";

const RECORD_DURATION_MS = 120_000; // 2 minutes

function App() {
  const [status, setStatus] = useState("Loading shader...");
  const started = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const canvas = document.querySelector("canvas");
      if (!canvas || started.current) return;
      started.current = true;
      clearInterval(interval);

      // Give shader a moment to stabilize before recording
      setTimeout(() => {
        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, {
          mimeType: "video/webm; codecs=vp8",
          videoBitsPerSecond: 8_000_000,
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "shader-gradient.webm";
          a.click();
          URL.revokeObjectURL(url);
          setStatus("Done! File downloaded.");
        };

        recorder.start(1000);
        setStatus("Recording...");

        const startTime = Date.now();
        const timer = setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          const remaining = Math.max(
            0,
            Math.ceil((RECORD_DURATION_MS - (Date.now() - startTime)) / 1000)
          );
          setStatus(`Recording... ${elapsed}s / ${remaining}s remaining`);
        }, 1000);

        setTimeout(() => {
          clearInterval(timer);
          recorder.stop();
          setStatus("Processing...");
        }, RECORD_DURATION_MS);
      }, 2000);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <ShaderGradientCanvas
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
        }}
        pixelDensity={1}
      >
        <ShaderGradient
          animate="on"
          axesHelper="off"
          brightness={1.2}
          cAzimuthAngle={180}
          cDistance={5}
          cPolarAngle={80}
          cameraZoom={1}
          color1="#ff6e00"
          color2="#141414"
          color3="#000013"
          destination="onCanvas"
          embedMode="off"
          envPreset="city"
          format="gif"
          fov={45}
          frameRate={10}
          gizmoHelper="hide"
          grain="on"
          lightType="3d"
          pixelDensity={1}
          positionX={-1.4}
          positionY={0}
          positionZ={0}
          range="disabled"
          rangeEnd={40}
          rangeStart={0}
          reflection={0.1}
          rotationX={0}
          rotationY={10}
          rotationZ={50}
          shader="defaults"
          type="waterPlane"
          uAmplitude={1}
          uDensity={0.7}
          uFrequency={5.5}
          uSpeed={0.1}
          uStrength={4}
          uTime={0}
          wireframe={false}
          zoomOut={false}
        />
      </ShaderGradientCanvas>
      <div
        style={{
          position: "fixed",
          bottom: 20,
          left: 20,
          color: "white",
          fontFamily: "monospace",
          fontSize: 14,
          background: "rgba(0,0,0,0.5)",
          padding: "8px 12px",
          borderRadius: 6,
          zIndex: 10,
        }}
      >
        {status}
      </div>
    </>
  );
}

export default App;
