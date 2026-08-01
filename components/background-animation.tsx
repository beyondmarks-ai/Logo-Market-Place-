"use client";

import { useEffect, useRef } from "react";

const clamp = (value: number, minimum = 0, maximum = 1) =>
  Math.min(maximum, Math.max(minimum, value));

const smoothstep = (edgeA: number, edgeB: number, value: number) => {
  const progress = clamp((value - edgeA) / (edgeB - edgeA));
  return progress * progress * (3 - 2 * progress);
};

const dotVariation = (column: number, row: number) => {
  const value = Math.sin(column * 91.73 + row * 47.21) * 43758.5453;
  return value - Math.floor(value);
};

const gradientStops = [
  { position: 0, color: [255, 255, 255] },
  { position: 0.32, color: [222, 212, 255] },
  { position: 0.6, color: [173, 121, 255] },
  { position: 0.82, color: [227, 126, 216] },
  { position: 1, color: [255, 176, 140] },
] as const;

const gradientColorAt = (progress: number) => {
  const value = clamp(progress);
  const upperIndex = gradientStops.findIndex((stop) => stop.position >= value);
  const endIndex = upperIndex <= 0 ? 1 : upperIndex;
  const start = gradientStops[endIndex - 1];
  const end = gradientStops[endIndex];
  const mix = (value - start.position) / (end.position - start.position);
  const color = start.color.map((channel, index) =>
    Math.round(channel + (end.color[index] - channel) * mix),
  );
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
};

export function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let animationFrame = 0;

    const resize = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const drawDot = (
      x: number,
      y: number,
      radius: number,
      color: string,
      opacity: number,
      blur: number,
    ) => {
      context.save();
      context.globalAlpha = opacity;
      context.fillStyle = color;
      context.shadowColor = color;
      context.shadowBlur = blur;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      context.restore();
    };

    const render = (time = 0) => {
      context.clearRect(0, 0, width, height);

      const spacing = width < 700 ? 28 : 34;
      const columns = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;
      const gridWidth = (columns - 1) * spacing;
      const gridHeight = (rows - 1) * spacing;
      const startX = (width - gridWidth) / 2;
      const startY = (height - gridHeight) / 2;
      const cornerWidth = Math.min(width * 0.34, 500);
      const cornerHeight = Math.min(height * 0.42, 380);
      const cornerRadius = Math.sqrt(
        (cornerWidth / spacing) ** 2 + (cornerHeight / spacing) ** 2,
      );
      const baseCycle = reducedMotion ? 0.32 : (time % 10000) / 10000;

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const x = startX + column * spacing;
          const y = startY + row * spacing;
          const variation = dotVariation(column, row);
          const leftDistance = Math.max(0, x);
          const rightDistance = Math.max(0, width - x);
          const topDistance = Math.max(0, y);
          const bottomDistance = Math.max(0, height - y);
          const cornerDistances = [
            Math.sqrt((leftDistance / cornerWidth) ** 2 + (topDistance / cornerHeight) ** 2),
            Math.sqrt((rightDistance / cornerWidth) ** 2 + (topDistance / cornerHeight) ** 2),
            Math.sqrt(
              (rightDistance / cornerWidth) ** 2 + (bottomDistance / cornerHeight) ** 2,
            ),
            Math.sqrt(
              (leftDistance / cornerWidth) ** 2 + (bottomDistance / cornerHeight) ** 2,
            ),
          ];
          const nearestCorner = cornerDistances.indexOf(Math.min(...cornerDistances));
          const cornerDistance = cornerDistances[nearestCorner];
          const cornerMask = 1 - smoothstep(0.42, 1.08, cornerDistance);

          if (cornerMask <= 0.003) continue;

          const phase = (baseCycle + nearestCorner * 0.17) % 1;
          const envelope =
            smoothstep(0.04, 0.2, phase) * (1 - smoothstep(0.58, 0.8, phase));
          const bloomRadius =
            0.8 + smoothstep(0.06, 0.56, phase) * cornerRadius;
          const distanceInDots =
            cornerDistance *
            Math.sqrt((cornerWidth / spacing) ** 2 + (cornerHeight / spacing) ** 2);
          const activation =
            clamp(
              1 - smoothstep(bloomRadius - 1.2, bloomRadius + 0.55, distanceInDots),
            ) *
            envelope *
            cornerMask;

          const idlePulse = reducedMotion
            ? 0.6
            : 0.48 + Math.sin(time * 0.0015 + column * 0.63 + row * 0.37) * 0.16;
          const redOpacity =
            (0.07 + idlePulse * 0.075) * cornerMask * (1 - activation * 0.82);
          drawDot(x, y, 1.3, "#d40b2f", redOpacity, 5);

          if (activation > 0.015) {
            const gradientOpacity = smoothstep(0.03, 0.88, activation);
            const gradientProgress = clamp(
              x / Math.max(width, 1) + (y / Math.max(height, 1) - 0.5) * 0.12,
            );
            drawDot(
              x,
              y,
              1.65 + gradientOpacity * 0.7,
              gradientColorAt(gradientProgress),
              gradientOpacity * 0.92,
              5 + gradientOpacity * 4,
            );
          }
        }
      }

      if (!reducedMotion) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const handleResize = () => {
      resize();
      if (reducedMotion) render();
    };

    resize();
    render();
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="background-animation" aria-hidden="true" />;
}
