import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { CHAIBASA_PLACES, RAILWAY_LINES } from '../data/locations';

const iconBase = 'https://unpkg.com/leaflet@1.9.4/dist/images/';
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconBase + 'marker-icon-2x.png',
  iconUrl: iconBase + 'marker-icon.png',
  shadowUrl: iconBase + 'marker-shadow.png',
});

interface Props {
  from: string;
  to: string;
  distance: number;
  duration: number;
  interactive?: boolean;
}

function makeCircleIcon(color: string) {
  return L.divIcon({
    html: `<div style="width:16px;height:16px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
}

function makeEmojiIcon(symbol: string) {
  return L.divIcon({
    html: `<div style="font-size:16px;text-align:center;background:white;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,0.3);width:28px;height:28px;display:flex;align-items:center;justify-content:center;">${symbol}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

export default function LeafletMap({ from, to, distance, duration, interactive }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const railwayLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [22.6500, 85.9500],
      zoom: 10,
      zoomControl: false,
      attributionControl: false,
    });
    mapRef.current = map;
    routeLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    railwayLayerRef.current = L.layerGroup().addTo(map);

    // Tile layers
    const osmLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      { maxZoom: 19 }
    );
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, attribution: 'Tiles © Esri' }
    );
    const darkLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { maxZoom: 19, attribution: '© CartoDB' }
    );

    osmLayer.addTo(map);

    L.control.layers(
      { 'Standard': osmLayer, 'Satellite': satelliteLayer, 'Dark Mode': darkLayer },
      {},
      { position: 'topright', collapsed: true }
    ).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Locate Me
    const LocateControl = L.Control.extend({
      onAdd() {
        const btn = L.DomUtil.create('button');
        btn.style.cssText = `
          background: white; border: 2px solid rgba(0,0,0,0.2); border-radius: 6px;
          padding: 5px 10px; font-size: 12px; font-weight: bold; cursor: pointer;
          box-shadow: 0 1px 5px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 5px;
          font-family: inherit; color: #2c3e50;
        `;
        btn.innerHTML = '🎯 Locate Me';
        L.DomEvent.on(btn, 'click', (e) => {
          L.DomEvent.stop(e);
          map.locate({ setView: true, maxZoom: 15 });
        });
        return btn;
      },
    });
    new LocateControl({ position: 'topleft' }).addTo(map);

    // User location events
    let userMarker: L.Marker | null = null;
    let userCircle: L.Circle | null = null;

    map.on('locationfound', (e) => {
      if (userMarker) map.removeLayer(userMarker);
      if (userCircle) map.removeLayer(userCircle);
      const dotIcon = L.divIcon({
        html: `<div style="background:#2980b9;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.5)"></div>`,
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      userMarker = L.marker(e.latlng, { icon: dotIcon }).addTo(map)
        .bindPopup('<b style="color:#2980b9">📍 My Location</b>').openPopup();
      userCircle = L.circle(e.latlng, { radius: e.accuracy / 2, color: '#2980b9', fillColor: '#3498db', fillOpacity: 0.15, weight: 1 }).addTo(map);
    });

    map.on('locationerror', () => {});

    // Draw railway lines
    const railwayLayer = railwayLayerRef.current;
    if (railwayLayer) {
      RAILWAY_LINES.forEach(line => {
        const baseLine = L.polyline(line.track, {
          color: line.color,
          weight: 5,
          opacity: 0.85,
        }).addTo(railwayLayer);
        baseLine.bindTooltip(`<b>${line.name}</b>`, { sticky: true, className: '' });

        L.polyline(line.track, {
          color: '#ffffff',
          weight: 2.5,
          dashArray: '6, 8',
          opacity: 0.7,
          interactive: false,
        }).addTo(railwayLayer);
      });
    }

    // Place markers for known locations
    const markersLayer = markersLayerRef.current;
    if (markersLayer && interactive) {
      CHAIBASA_PLACES.forEach(place => {
        const marker = L.marker([place.lat, place.lng], { icon: makeEmojiIcon(place.symbol) }).addTo(markersLayer);
        marker.bindTooltip(place.name, { permanent: false, direction: 'bottom', offset: [0, 10] });
        marker.bindPopup(`
          <div style="font-family:sans-serif;min-width:140px;">
            <h3 style="margin:0;color:#1a73e8;font-size:14px;">${place.name}</h3>
            <span style="display:inline-block;margin-top:4px;padding:2px 6px;background:#eee;border-radius:4px;font-size:10px;font-weight:bold;">${place.category}</span>
            <p style="margin-top:6px;font-size:11px;color:#333;">${place.description}</p>
          </div>
        `);
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [interactive]);

  // Load route when from/to change
  const loadRoute = useCallback(async () => {
    const map = mapRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !routeLayer) return;

    routeLayer.clearLayers();

    try {
      const [fromRes, toRes] = await Promise.all([
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(from)}&limit=1&countrycodes=in`),
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(to)}&limit=1&countrycodes=in`),
      ]);

      const [fromData, toData]: Array<Array<{ lat: string; lon: string }>> = await Promise.all([
        fromRes.json(),
        toRes.json(),
      ]);

      if (!fromData[0] || !toData[0]) {
        // Try matching against our known places
        const fromPlace = CHAIBASA_PLACES.find(p => from.toLowerCase().includes(p.name.toLowerCase()));
        const toPlace = CHAIBASA_PLACES.find(p => to.toLowerCase().includes(p.name.toLowerCase()));

        if (fromPlace && toPlace) {
          const fromCoord: [number, number] = [fromPlace.lat, fromPlace.lng];
          const toCoord: [number, number] = [toPlace.lat, toPlace.lng];

          L.marker(fromCoord, { icon: makeCircleIcon('#22c55e') }).addTo(routeLayer)
            .bindPopup(`<b>${fromPlace.name}</b><br><small>Origin</small>`);
          L.marker(toCoord, { icon: makeCircleIcon('#ef4444') }).addTo(routeLayer)
            .bindPopup(`<b>${toPlace.name}</b><br><small>Destination</small>`);

          L.polyline([fromCoord, toCoord], { color: '#1e3a8a', weight: 7, opacity: 0.25 }).addTo(routeLayer);
          L.polyline([fromCoord, toCoord], { color: '#3b82f6', weight: 4, opacity: 0.95, dashArray: '10, 8' }).addTo(routeLayer);

          map.fitBounds(L.latLngBounds([fromCoord, toCoord]), { padding: [40, 40], maxZoom: 14 });
          return;
        }

        map.setView([22.6500, 85.9500], 10);
        return;
      }

      const fromCoord: [number, number] = [parseFloat(fromData[0].lat), parseFloat(fromData[0].lon)];
      const toCoord: [number, number] = [parseFloat(toData[0].lat), parseFloat(toData[0].lon)];

      // Fetch route from OSRM
      const osrmUrl =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${fromCoord[1]},${fromCoord[0]};${toCoord[1]},${toCoord[0]}` +
        `?overview=full&geometries=geojson`;

      const routeRes = await fetch(osrmUrl);
      const routeData = await routeRes.json();

      if (routeData.routes?.[0]) {
        const coords = routeData.routes[0].geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
        );
        L.polyline(coords, { color: '#1e3a8a', weight: 7, opacity: 0.25 }).addTo(routeLayer);
        L.polyline(coords, { color: '#3b82f6', weight: 4.5, opacity: 0.95 }).addTo(routeLayer);
      }

      L.marker(fromCoord, { icon: makeCircleIcon('#22c55e') }).addTo(routeLayer)
        .bindPopup(`<b>${from.split(',')[0]}</b><br><small>Origin</small>`);
      L.marker(toCoord, { icon: makeCircleIcon('#ef4444') }).addTo(routeLayer)
        .bindPopup(`<b>${to.split(',')[0]}</b><br><small>Destination</small>`);

      map.fitBounds(L.latLngBounds([fromCoord, toCoord]), { padding: [40, 40], maxZoom: 14 });
    } catch {
      map.setView([22.6500, 85.9500], 10);
    }
  }, [from, to]);

  useEffect(() => {
    loadRoute();
  }, [loadRoute]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: interactive ? 320 : 200 }}>
      <div ref={containerRef} className="w-full h-full" />
      {/* Distance/time pill overlay */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 pointer-events-none z-[500]">
        <div
          className="text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg whitespace-nowrap"
          style={{ background: 'rgba(15,23,42,0.82)', backdropFilter: 'blur(6px)' }}
        >
          <span style={{ color: '#4ade80' }}>●</span>
          <span>{distance} km · ~{duration} min</span>
        </div>
      </div>
    </div>
  );
}

