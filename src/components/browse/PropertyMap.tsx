import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Property } from "./propertyData";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const activeIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [30, 46],
  iconAnchor: [15, 46],
  popupAnchor: [0, -46],
  className: "leaflet-marker-active",
});

const defaultIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

interface Props {
  properties: Property[];
  focusedId: string | null;
  onMarkerClick: (p: Property) => void;
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 15, { duration: 0.8 });
  }, [lat, lng, map]);
  return null;
}

const PropertyMap = ({ properties, focusedId, onMarkerClick }: Props) => {
  const center: [number, number] = [9.015, 38.775];
  const focused = properties.find((p) => p.id === focusedId);

  return (
    <div className="rounded-xl overflow-hidden border border-border h-72 md:h-80">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {focused && <FlyTo lat={focused.lat} lng={focused.lng} />}
        {properties.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={p.id === focusedId ? activeIcon : defaultIcon}
            eventHandlers={{ click: () => onMarkerClick(p) }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{p.title}</p>
                <p className="text-muted-foreground">{p.price}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
