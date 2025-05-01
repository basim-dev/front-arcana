import { useState, useEffect } from "react";

export default function GrainOverlay() {
  const [opacity, setOpacity] = useState(0.05);
  const [rotation, setRotation] = useState(0.1);

  // Subtly animate the grain for more visual interest
  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity((prev) => {
        // Oscillate opacity between 0.04 and 0.06
        const newOpacity = prev + (Math.random() * 0.004 - 0.002);
        return Math.max(0.04, Math.min(0.06, newOpacity));
      });

      setRotation((prev) => {
        // Slightly rotate between -0.2 and 0.2 degrees
        const newRotation = prev + (Math.random() * 0.02 - 0.01);
        return Math.max(-0.2, Math.min(0.2, newRotation));
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      <svg
        className="w-full h-full"
        style={{
          opacity: opacity,
          transform: `scale(1.01) rotate(${rotation}deg)`,
          filter: "contrast(120%)",
        }}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
              seed={Math.floor(Math.random() * 100)}
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
}
