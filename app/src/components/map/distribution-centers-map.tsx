'use client';

import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Center {
  id: string;
  name: string;
  address: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

interface Props {
  centers: Center[];
  onSelectCenter: (center: Center | null) => void;
  selectedCenter: Center | null;
}

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function DistributionCentersMap({ centers, onSelectCenter, selectedCenter }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const validCenters = useMemo(
    () => centers.filter((c) => c.latitude && c.longitude),
    [centers]
  );

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || validCenters.length === 0) return;

    // Clean up existing map if any
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Create new map
    const map = L.map(containerRef.current).setView(
      [validCenters[0].latitude!, validCenters[0].longitude!],
      13
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add markers
    markersRef.current = validCenters.map((center) => {
      const marker = L.marker([center.latitude!, center.longitude!], {
        icon: defaultIcon,
      }).addTo(map);

      marker.bindPopup(`
        <div style="min-width: 150px;">
          <h3 style="font-weight: 600; font-size: 1rem; margin: 0;">${center.name}</h3>
          <p style="font-size: 0.875rem; color: #666; margin: 0.25rem 0 0 0;">${center.address}</p>
          ${center.description ? `<p style="font-size: 0.875rem; color: #888; margin: 0.5rem 0 0 0;">${center.description}</p>` : ''}
        </div>
      `);

      marker.on('click', () => onSelectCenter(center));

      return marker;
    });

    // Fit bounds if multiple centers
    if (validCenters.length > 1) {
      const bounds = L.latLngBounds(
        validCenters.map((c) => [c.latitude!, c.longitude!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    mapRef.current = map;

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
    };
  }, [validCenters, onSelectCenter]);

  // Handle selected center change
  useEffect(() => {
    if (!mapRef.current || !selectedCenter?.latitude || !selectedCenter?.longitude) return;

    mapRef.current.flyTo([selectedCenter.latitude, selectedCenter.longitude], 14, {
      duration: 0.5,
    });
  }, [selectedCenter]);

  if (validCenters.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="h-[400px] rounded-lg overflow-hidden shadow-md"
      style={{ zIndex: 0 }}
    />
  );
}
