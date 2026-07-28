import { mapsEmbedUrl } from "@/lib/utils";

type Props = {
  query?: string;
  lat?: number;
  lng?: number;
  zoom?: number;
  title?: string;
  className?: string;
};

export function GoogleMapEmbed({
  query,
  lat,
  lng,
  zoom = 15,
  title = "Map",
  className = "",
}: Props) {
  const src = mapsEmbedUrl({ query, lat, lng, zoom });

  return (
    <div
      className={`relative min-h-[260px] overflow-hidden rounded-xl border border-border-dark bg-surface-dark ${className}`}
    >
      <iframe
        title={title}
        src={src}
        className="absolute inset-0 h-full w-full border-0 grayscale-[20%] contrast-[1.05]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
