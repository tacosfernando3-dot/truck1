import type { GalleryItem } from "@/lib/types";
import { images } from "@/data/images";

export const galleryItems: GalleryItem[] = [
  {
    id: "g1",
    alt: "Los Compadres food truck parked at night",
    image: images.truckGallery,
  },
  {
    id: "g2",
    alt: "Close-up of street tacos with cilantro and onion",
    image: images.tacoGallery,
  },
  {
    id: "g3",
    alt: "Loaded fries in a takeout tray",
    image: images.friesGallery,
  },
  {
    id: "g4",
    alt: "Smash burger with melted cheese",
    image: images.burgerGallery,
  },
  {
    id: "g5",
    alt: "Korean-inspired rice bowl with vegetables",
    image: images.bowlGallery,
  },
];
