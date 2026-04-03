import type { Tables } from "@/integrations/supabase/types";

export type Property = {
  id: string;
  images: string[];
  title: string;
  price: string;
  pricePerSqm: string;
  baseRent?: string;
  location: string;
  city: string;
  type: string;
  mode: "Rent" | "Buy";
  rooms: number;
  livingSpace: string;
  propertySize: string;
  highlight: string;
  description: string;
  surroundings: string;
  transport: string;
  available: string;
  lat: number;
  lng: number;
  tourUrl?: string;
};

type PropertyRow = Tables<"properties">;

export const cities = ["All", "Addis Ababa", "Dire Dawa", "Hawassa"];
export const types = ["All", "Villa", "Apartment", "Penthouse", "Studio", "House", "Duplex"];
export const modes = ["All", "Rent", "Buy"];

export const sortOptions = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "size-desc", label: "Largest First" },
  { value: "rooms-desc", label: "Most Rooms" },
  { value: "newest", label: "Newest" },
];

export const parsePrice = (price: string): number => {
  const num = price.replace(/[^0-9.]/g, "");
  return parseFloat(num) || 0;
};

export const parseSqm = (size: string): number => {
  const num = size.replace(/[^0-9.]/g, "");
  return parseFloat(num) || 0;
};

/** Map a DB row to the Property shape used by UI components */
export const mapDbProperty = (row: PropertyRow): Property => ({
  id: row.id,
  images: row.images?.length ? row.images : ["/placeholder.svg"],
  title: row.title,
  price: row.price,
  pricePerSqm: row.price_per_sqm || "",
  baseRent: row.base_rent || undefined,
  location: row.location || "",
  city: extractCity(row.location || ""),
  type: row.type,
  mode: row.mode as "Rent" | "Buy",
  rooms: row.rooms,
  livingSpace: row.living_space || "",
  propertySize: row.property_size || "",
  highlight: "",
  description: row.description || "",
  surroundings: row.surroundings || "",
  transport: row.transport || "",
  available: row.available,
  lat: row.lat,
  lng: row.lng,
  tourUrl: row.tour_url || undefined,
});

function extractCity(location: string): string {
  if (location.toLowerCase().includes("addis")) return "Addis Ababa";
  if (location.toLowerCase().includes("dire")) return "Dire Dawa";
  if (location.toLowerCase().includes("hawassa")) return "Hawassa";
  return "Other";
}
