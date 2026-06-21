import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { CHAIBASA_PLACES } from '../data/locations';

const iconBase = 'https://unpkg.com/leaflet@1.9.4/dist/images/';
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconBase + 'marker-icon-2x.png',
  iconUrl: iconBase + 'marker-icon.png',
  shadowUrl: iconBase + 'marker-shadow.png',
});

interface Props {
  placeName: string;
  height?: number;
}

function makePinIcon(color: string) {
  return L.divIcon({
    html: `<div style="width:20px;height:20px;background:${color};border-radius:50%;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
  });
}

export default function LocationPinMap({ placeName, height = 160 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pinLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [22.6500, 85.9500],
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
    });
    mapRef.current = map;
    pinLayerRef.current = L.layerGroup().addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const loadPin = useCallback(async () => {
    const map = mapRef.current;
    const pinLayer = pinLayerRef.current;
    if (!map || !pinLayer) return;

    pinLayer.clearLayers();

    const known = CHAIBASA_PLACES.find(
      p =>
        placeName.toLowerCase().includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(placeName.toLowerCase())
    );
    if (known) {
      const coord: [number, number] = [known.lat, known.lng];
      L.marker(coord, { icon: makePinIcon('#3b82f6') })
        .addTo(pinLayer)
        .bindPopup(
          `<b>${known.name}</b><br><small>${known.category}</small><br><small>${known.description}</small>`
        )
        .openPopup();
      map.setView(coord, 14);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          placeName + ', India'
        )}&limit=1&countrycodes=in`
      );
      const data = await res.json();
      if (data[0]) {
        const coord: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        L.marker(coord, { icon: makePinIcon('#3b82f6') })
          .addTo(pinLayer)
          .bindPopup(`<b>${placeName}</b>`)
          .openPopup();
        map.setView(coord, 14);
      }
    } catch {
      // geocoding fallback
    }
  }, [placeName]);

  useEffect(() => {
    loadPin();
  }, [loadPin]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-blue-200 shadow-sm" style={{ height }}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}