"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, X } from "lucide-react";

type MonoSvgCustomizerProps = {
  title: string;
  slug: string;
  path: string;
  onClose: () => void;
};

type ColorMode = "solid" | "gradient";

const solidPresets = ["#111111", "#ffffff", "#b70c1b", "#2563eb", "#16a34a", "#7c3aed"];
const gradientPresets = [
  { name: "Crimson", colors: ["#050405", "#ff3f4c"] },
  { name: "Ocean", colors: ["#0f172a", "#38bdf8"] },
  { name: "Aurora", colors: ["#16a34a", "#22d3ee"] },
  { name: "Sunset", colors: ["#f97316", "#db2777"] },
  { name: "Royal", colors: ["#312e81", "#a855f7"] },
] as const;

function paintSvg(source: string, mode: ColorMode, solidColor: string, gradientColors: [string, string]) {
  const cleaned = source
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+=(['"])[\s\S]*?\1/gi, "");
  const gradientId = "logo-market-gradient";
  const paint = mode === "solid" ? solidColor : `url(#${gradientId})`;
  let customized = cleaned.replace(/currentColor/gi, paint);
  customized = customized.replace(
    /(fill|stroke)=(['"])(?:#000(?:000)?|black)\2/gi,
    (_match, property: string, quote: string) => `${property}=${quote}${paint}${quote}`,
  );
  customized = customized.replace(/<svg\b([^>]*)>/i, (_openingTag, attributes: string) => {
    const cleanAttributes = attributes
      .replace(/\sfill=(['"])[\s\S]*?\1/gi, "")
      .replace(/\scolor=(['"])[\s\S]*?\1/gi, "");
    const inheritedColor = mode === "solid" ? ` color="${solidColor}"` : "";
    return `<svg${cleanAttributes} fill="${paint}"${inheritedColor}>`;
  });

  if (mode === "gradient") {
    const definition = `<defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${gradientColors[0]}"/><stop offset="100%" stop-color="${gradientColors[1]}"/></linearGradient></defs>`;
    customized = customized.replace(/<svg\b[^>]*>/i, (openingTag) => `${openingTag}${definition}`);
  }

  return customized;
}

export function MonoSvgCustomizer({ title, slug, path, onClose }: MonoSvgCustomizerProps) {
  const [sourceSvg, setSourceSvg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<ColorMode>("solid");
  const [solidColor, setSolidColor] = useState("#b70c1b");
  const [gradientColors, setGradientColors] = useState<[string, string]>(["#050405", "#ff3f4c"]);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    async function loadSvg() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/logos/download?path=${encodeURIComponent(path)}&name=${encodeURIComponent(slug)}`);
        if (!response.ok) throw new Error("Unable to load this mono SVG.");
        const svg = await response.text();
        if (!cancelled) setSourceSvg(svg);
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load this mono SVG.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadSvg();
    return () => { cancelled = true; };
  }, [path, slug]);

  const customizedSvg = useMemo(
    () => sourceSvg ? paintSvg(sourceSvg, mode, solidColor, gradientColors) : "",
    [gradientColors, mode, solidColor, sourceSvg],
  );

  useEffect(() => {
    if (!customizedSvg) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(new Blob([customizedSvg], { type: "image/svg+xml" }));
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [customizedSvg]);

  const downloadCustomizedSvg = () => {
    if (!customizedSvg) return;
    const url = URL.createObjectURL(new Blob([customizedSvg], { type: "image/svg+xml" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${slug}-${mode}.svg`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mono-customizer-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="mono-customizer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mono-customizer-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <p>MONO SVG STUDIO</p>
            <h2 id="mono-customizer-title">Customize {title}</h2>
          </div>
          <button type="button" aria-label="Close customizer" onClick={onClose} autoFocus><X /></button>
        </header>

        <div className="mono-customizer-content">
          <div className="mono-customizer-preview">
            {loading && <span>Loading SVG...</span>}
            {error && <span className="mono-customizer-error">{error}</span>}
            {!loading && !error && previewUrl && <img src={previewUrl} alt={`Customized ${title} preview`} />}
          </div>

          <div className="mono-customizer-controls">
            <div className="mono-mode-toggle" aria-label="Color style">
              <button type="button" aria-pressed={mode === "solid"} onClick={() => setMode("solid")}>Solid color</button>
              <button type="button" aria-pressed={mode === "gradient"} onClick={() => setMode("gradient")}>Gradient</button>
            </div>

            {mode === "solid" ? (
              <div className="mono-control-panel">
                <label className="mono-color-input">
                  <span>Logo color</span>
                  <div><input type="color" value={solidColor} onChange={(event) => setSolidColor(event.target.value)} /><code>{solidColor.toUpperCase()}</code></div>
                </label>
                <div className="mono-color-presets" aria-label="Solid color presets">
                  {solidPresets.map((color) => (
                    <button
                      type="button"
                      key={color}
                      aria-label={`Use ${color}`}
                      aria-pressed={solidColor === color}
                      style={{ background: color }}
                      onClick={() => setSolidColor(color)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="mono-control-panel">
                <span className="mono-control-label">Gradient presets</span>
                <div className="mono-gradient-presets">
                  {gradientPresets.map((preset) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => setGradientColors([preset.colors[0], preset.colors[1]])}
                      style={{ background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})` }}
                    >
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
                <div className="mono-gradient-colors">
                  <label><span>Start</span><input type="color" value={gradientColors[0]} onChange={(event) => setGradientColors([event.target.value, gradientColors[1]])} /></label>
                  <label><span>End</span><input type="color" value={gradientColors[1]} onChange={(event) => setGradientColors([gradientColors[0], event.target.value])} /></label>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="button" onClick={downloadCustomizedSvg} disabled={!customizedSvg || loading}>
            <Download aria-hidden="true" /> Download customized SVG
          </button>
        </footer>
      </section>
    </div>
  );
}