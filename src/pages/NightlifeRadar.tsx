import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { mockEvents, EventData } from "@/data/mockEvents";
import { ArrowLeft, Users, Flame, TrendingUp, MapPin, Loader2, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { sortByPopularity } from "@/lib/popularity";
import { useEvents } from "@/hooks/useEvents";
import { useMomentCount } from "@/hooks/useMoments";

import "leaflet/dist/leaflet.css";
import React, { useMemo, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const CITY = "Helsinki";
const HELSINKI_CENTER = { lat: 60.1699, lng: 24.9384 };

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const getRadarColor = (going: number): string => {
  if (going >= 200) return "hsl(346, 100%, 59%)";
  if (going >= 80) return "hsl(30, 100%, 55%)";
  return "hsl(50, 100%, 55%)";
};

const getRadarRadius = (going: number): number => {
  if (going >= 250) return 55;
  if (going >= 100) return 40;
  if (going >= 50) return 28;
  return 18;
};

const createRadarIcon = (going: number) => {
  const color = getRadarColor(going);
  const size = going >= 200 ? 42 : going >= 80 ? 36 : 30;
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" opacity="0.9">
        <animate attributeName="r" values="${size/2 - 4};${size/2 - 1};${size/2 - 4}" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="${size/2}" cy="${size/2}" r="${size/4}" fill="white" opacity="0.85"/>
      <text x="${size/2}" y="${size/2 + 4}" text-anchor="middle" fill="${color}" font-size="${going >= 200 ? 11 : 9}" font-weight="bold" font-family="sans-serif">
        ${going}
      </text>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });
};

const RadarPopup = ({ event, onNavigate }: { event: EventData; onNavigate: () => void }) => {
  const soldPercent = Math.round((event.ticketsSold / event.capacity) * 100);
  const { data: momentCount = 0 } = useMomentCount(event.id);

  return (
    <div className="min-w-[230px] p-0 font-heading">
      <div className="relative h-20 rounded-t-lg overflow-hidden -mx-[20px] -mt-[14px] mb-2">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, hsl(0 0% 4% / 0.9), transparent)" }} />
        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="text-sm font-bold text-white leading-tight">
            {event.studentEvent ? "🎓 " : ""}{event.title}
          </h3>
        </div>
      </div>
      <div className="space-y-2 px-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-gray-300">🔥 {event.going} people</span>
          <span className="text-xs font-mono font-bold" style={{ color: getRadarColor(event.going) }}>{soldPercent}% sold</span>
        </div>
        {momentCount > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-primary">
            <Camera size={11} />
            <span>📸 {momentCount} moments in 10min</span>
          </div>
        )}
        {event.friendsHere.length > 0 && (
          <p className="text-[11px] font-mono text-green-400">
            👯 {event.friendsHere.join(", ")} {event.friendsHere.length === 1 ? "is" : "are"} here
          </p>
        )}
        <button
          onClick={onNavigate}
          className="w-full py-2 rounded-md text-xs font-heading font-bold tracking-wider text-white bg-primary"
        >
          VIEW EVENT
        </button>
      </div>
    </div>
  );
};

const NightlifeRadar = () => {
  const navigate = useNavigate();
  const { data: dbEvents, isLoading } = useEvents(CITY);
  const [trendingOpen, setTrendingOpen] = useState(false);

  const allEvents = useMemo(() => {
    const dbIds = new Set((dbEvents || []).map(e => e.id));
    const cityMocks = mockEvents.filter(e => e.city === CITY && !dbIds.has(e.id));
    return [...(dbEvents || []), ...cityMocks];
  }, [dbEvents]);

  const mappableEvents = allEvents.filter(e => e.lat !== 0 && e.lng !== 0);
  const trending = sortByPopularity(allEvents).slice(0, 5);

  return (
    <div className="h-[100dvh] relative bg-background">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-0 left-0 right-0 z-[1000] px-4 pt-12 pb-2 bg-gradient-to-b from-background via-background/90 to-transparent"
      >
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card/80 backdrop-blur-sm">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Live Nightlife — {CITY}</h1>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              Live · {allEvents.length} active events
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-mono text-success">LIVE</span>
          </div>
        </div>
      </motion.div>

      {/* Trending panel */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute bottom-20 left-0 right-0 z-[1000] px-4"
      >
        <button
          onClick={() => setTrendingOpen(!trendingOpen)}
          className="w-full bg-card/90 backdrop-blur-md rounded-xl border border-border p-4 text-left"
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-primary" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex-1">Trending in {CITY}</span>
            {trendingOpen ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronUp size={16} className="text-muted-foreground" />}
          </div>

          {trendingOpen && (
            <div className="space-y-2 mt-3" onClick={(e) => e.stopPropagation()}>
              {trending.map((event, i) => (
                <button
                  key={event.id}
                  onClick={() => navigate(`/event/${event.id}`)}
                  className="w-full flex items-center gap-3 py-1.5 text-left"
                >
                  <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}.</span>
                  <img src={event.image} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-heading font-bold text-foreground truncate">
                      {event.studentEvent ? "🎓 " : ""}{event.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground">{event.going} going</span>
                      {event.friendsHere.length > 0 && (
                        <span className="text-[10px] font-mono text-success">
                          👯 {event.friendsHere.length} here
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: getRadarColor(event.going), boxShadow: `0 0 6px ${getRadarColor(event.going)}` }}
                  />
                </button>
              ))}
            </div>
          )}
        </button>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute top-28 right-3 z-[1000] bg-card/90 backdrop-blur-md rounded-lg p-3 border border-border"
      >
        <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Crowd</p>
        <div className="space-y-1.5">
          {[
            { label: "Packed", color: "hsl(346, 100%, 59%)" },
            { label: "Active", color: "hsl(30, 100%, 55%)" },
            { label: "Chill", color: "hsl(50, 100%, 55%)" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
              <span className="text-[10px] font-mono text-foreground/70">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Map — centered on Helsinki */}
      <MapContainer
        center={[HELSINKI_CENTER.lat, HELSINKI_CENTER.lng]}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
        style={{ background: "hsl(0 0% 4%)" }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {mappableEvents.map((event) => {
          const radius = getRadarRadius(event.going);
          const color = getRadarColor(event.going);

          return (
            <React.Fragment key={event.id}>
              <CircleMarker
                center={[event.lat, event.lng]}
                radius={radius}
                pathOptions={{ color: "transparent", fillColor: color, fillOpacity: 0.15 }}
              />
              <CircleMarker
                center={[event.lat, event.lng]}
                radius={radius * 0.6}
                pathOptions={{ color, weight: 1, fillColor: color, fillOpacity: 0.1 }}
              />
              <Marker position={[event.lat, event.lng]} icon={createRadarIcon(event.going)}>
                <Popup className="party-map-popup" closeButton={false} maxWidth={260} minWidth={240}>
                  <RadarPopup event={event} onNavigate={() => navigate(`/event/${event.id}`)} />
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default NightlifeRadar;
