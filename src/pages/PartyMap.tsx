import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import { mockEvents, EventData } from "@/data/mockEvents";
import { ArrowLeft, Users, Flame, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const getHeatColor = (soldPercent: number): string => {
  if (soldPercent >= 90) return "hsl(267, 100%, 50%)"; // primary — on fire
  if (soldPercent >= 70) return "hsl(346, 100%, 59%)"; // destructive — hot
  if (soldPercent >= 40) return "hsl(40, 100%, 50%)";  // warm amber
  return "hsl(200, 60%, 50%)";                          // cool blue
};

const getHeatRadius = (going: number): number => {
  if (going >= 250) return 60;
  if (going >= 100) return 45;
  if (going >= 50) return 32;
  return 22;
};

const getHeatOpacity = (soldPercent: number): number => {
  if (soldPercent >= 80) return 0.45;
  if (soldPercent >= 50) return 0.3;
  return 0.2;
};

const createCustomIcon = (soldPercent: number) => {
  const color = getHeatColor(soldPercent);
  const svgIcon = `
    <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z" 
            fill="${color}" filter="url(#glow)" opacity="0.95"/>
      <circle cx="18" cy="18" r="8" fill="white" opacity="0.9"/>
      <text x="18" y="22" text-anchor="middle" fill="${color}" font-size="10" font-weight="bold" font-family="sans-serif">
        ${soldPercent}
      </text>
    </svg>`;
  return L.divIcon({
    html: svgIcon,
    className: "",
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
};

interface EventPopupProps {
  event: EventData;
  onNavigate: () => void;
}

const EventPopup = ({ event, onNavigate }: EventPopupProps) => {
  const soldPercent = Math.round((event.ticketsSold / event.capacity) * 100);
  const heatColor = getHeatColor(soldPercent);

  return (
    <div className="min-w-[220px] p-0 font-heading">
      <div className="relative h-24 rounded-t-lg overflow-hidden -mx-[20px] -mt-[14px] mb-3">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, hsl(0 0% 4% / 0.85), transparent)` }} />
        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="text-sm font-bold text-white leading-tight">{event.title}</h3>
        </div>
      </div>

      <div className="space-y-2 px-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users size={13} style={{ color: heatColor }} />
            <span className="text-xs font-mono text-gray-300">{event.going} going</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame size={13} style={{ color: heatColor }} />
            <span className="text-xs font-mono font-bold" style={{ color: heatColor }}>{soldPercent}% sold</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Ticket size={13} className="text-gray-400" />
          <span className="text-xs font-mono text-gray-300">
            {event.currency}{event.price} · {event.date}
          </span>
        </div>

        {soldPercent >= 80 && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono font-bold w-fit"
            style={{ background: `${heatColor}22`, color: heatColor }}
          >
            🔥 {soldPercent >= 90 ? "ALMOST SOLD OUT" : "TRENDING"}
          </div>
        )}

        <button
          onClick={onNavigate}
          className="w-full mt-1 py-2 rounded-md text-xs font-heading font-bold tracking-wider uppercase text-white"
          style={{ background: heatColor }}
        >
          VIEW EVENT
        </button>
      </div>
    </div>
  );
};

const PartyMap = () => {
  const navigate = useNavigate();

  // Center map on the average of all event coordinates
  const centerLat = mockEvents.reduce((sum, e) => sum + e.lat, 0) / mockEvents.length;
  const centerLng = mockEvents.reduce((sum, e) => sum + e.lng, 0) / mockEvents.length;

  return (
    <div className="h-[100dvh] relative bg-background">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-0 left-0 right-0 z-[1000] px-4 pt-12 pb-3 bg-gradient-to-b from-background via-background/90 to-transparent"
      >
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card/80 backdrop-blur-sm">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Live Party Map</h1>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              {mockEvents.length} events nearby
            </p>
          </div>
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute top-28 right-3 z-[1000] bg-card/90 backdrop-blur-md rounded-lg p-3 border border-border"
      >
        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Heat</p>
        <div className="space-y-1.5">
          {[
            { label: "🔥 On Fire", color: "hsl(267, 100%, 50%)" },
            { label: "Hot", color: "hsl(346, 100%, 59%)" },
            { label: "Warm", color: "hsl(40, 100%, 50%)" },
            { label: "Cool", color: "hsl(200, 60%, 50%)" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
              <span className="text-[10px] font-mono text-foreground/70">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Map */}
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={5}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
        style={{ background: "hsl(0 0% 4%)" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        {mockEvents.map((event) => {
          const soldPercent = Math.round((event.ticketsSold / event.capacity) * 100);
          const heatColor = getHeatColor(soldPercent);
          const heatRadius = getHeatRadius(event.going);

          return (
            <div key={event.id}>
              {/* Heat glow circle */}
              <CircleMarker
                center={[event.lat, event.lng]}
                radius={heatRadius}
                pathOptions={{
                  color: "transparent",
                  fillColor: heatColor,
                  fillOpacity: getHeatOpacity(soldPercent),
                }}
              />
              {/* Pulsing inner ring */}
              <CircleMarker
                center={[event.lat, event.lng]}
                radius={heatRadius * 0.5}
                pathOptions={{
                  color: heatColor,
                  weight: 1,
                  fillColor: heatColor,
                  fillOpacity: 0.15,
                }}
              />
              {/* Pin marker */}
              <Marker
                position={[event.lat, event.lng]}
                icon={createCustomIcon(soldPercent)}
              >
                <Popup
                  className="party-map-popup"
                  closeButton={false}
                  maxWidth={260}
                  minWidth={240}
                >
                  <EventPopup
                    event={event}
                    onNavigate={() => navigate(`/event/${event.id}`)}
                  />
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default PartyMap;
