export type SvgColorOptions =
  | { mode: "original" }
  | { mode: "solid"; color: string }
  | { mode: "gradient"; start: string; end: string };

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(value: string) {
  return HEX_COLOR.test(value);
}

export function customizeSvg(source: string, options: SvgColorOptions) {
  if (options.mode === "original") return source;

  const cleaned = source
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+=(['"])[\s\S]*?\1/gi, "");
  const gradientId = "logo-market-api-gradient";
  const paint = options.mode === "solid" ? options.color : `url(#${gradientId})`;
  let customized = cleaned.replace(/currentColor/gi, paint);
  customized = customized.replace(
    /(fill|stroke)=(['"])(?:#000(?:000)?|black)\2/gi,
    (_match, property: string, quote: string) => `${property}=${quote}${paint}${quote}`,
  );
  customized = customized.replace(/<svg\b([^>]*)>/i, (_openingTag, attributes: string) => {
    const cleanAttributes = attributes
      .replace(/\sfill=(['"])[\s\S]*?\1/gi, "")
      .replace(/\scolor=(['"])[\s\S]*?\1/gi, "");
    const inheritedColor = options.mode === "solid" ? ` color="${options.color}"` : "";
    return `<svg${cleanAttributes} fill="${paint}"${inheritedColor}>`;
  });

  if (options.mode === "gradient") {
    const definition = `<defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${options.start}"/><stop offset="100%" stop-color="${options.end}"/></linearGradient></defs>`;
    customized = customized.replace(/<svg\b[^>]*>/i, (openingTag) => `${openingTag}${definition}`);
  }

  return customized;
}
