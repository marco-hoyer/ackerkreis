'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

function MapController({ selectedCenter, centers }: { selectedCenter: Center | null; centers: Center[] }) {
  const map = useMap();

  useEffect(() => {
    if (selectedCenter?.latitude && selectedCenter?.longitude) {
      map.flyTo([selectedCenter.latitude, selectedCenter.longitude], 14, {
        duration: 0.5,
      });
    }
  }, [selectedCenter, map]);

  useEffect(() => {
    if (centers.length > 1) {
      const bounds = L.latLngBounds(
        centers.map((c) => [c.latitude!, c.longitude!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [centers, map]);

  return null;
}

export default function DistributionCentersMap({ centers, onSelectCenter, selectedCenter }: Props) {
  const validCenters = useMemo(() => centers.filter((c) => c.latitude && c.longitude), [centers]);

  if (validCenters.length === 0) {
    return null;
  }

  const defaultCenter: [number, number] = [
    validCenters[0].latitude!,
    validCenters[0].longitude!,
  ];

  return (
    <div className="h-[400px] rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController selectedCenter={selectedCenter} centers={validCenters} />
        {validCenters.map((center) => (
          <Marker
            key={center.id}
            position={[center.latitude!, center.longitude!]}
            icon={defaultIcon}
            eventHandlers={{
              click: () => onSelectCenter(center),
            }}
          >
            <Popup>
              <div className="min-w-[150px]">
                <h3 className="font-semibold text-base">{center.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{center.address}</p>
                {center.description && (
                  <p className="text-sm text-gray-500 mt-2">{center.description}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
