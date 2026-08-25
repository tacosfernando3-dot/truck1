/** Persist focal point on image URLs until DB columns exist: `?focus=x,y`. */

function clamp(value: number) {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

export function splitMenuImage(image: string): {
  src: string;
  focus: { x: number; y: number };
} {
  const qIndex = image.indexOf("?");
  if (qIndex === -1) {
    return { src: image, focus: { x: 50, y: 50 } };
  }

  const base = image.slice(0, qIndex);
  const params = new URLSearchParams(image.slice(qIndex + 1));
  const raw = params.get("focus");
  params.delete("focus");
  const qs = params.toString();
  const src = qs ? `${base}?${qs}` : base;

  if (!raw) {
    return { src, focus: { x: 50, y: 50 } };
  }

  const [xs, ys] = raw.split(",");
  return {
    src,
    focus: { x: clamp(Number(xs)), y: clamp(Number(ys)) },
  };
}

export function joinMenuImage(
  image: string,
  focus?: { x: number; y: number } | null,
) {
  const { src } = splitMenuImage(image);
  const x = Math.round(clamp(focus?.x ?? 50));
  const y = Math.round(clamp(focus?.y ?? 50));
  if (x === 50 && y === 50) return src;
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}focus=${x},${y}`;
}
