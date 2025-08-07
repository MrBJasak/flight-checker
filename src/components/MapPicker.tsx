'use client';


import { Icon, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { HiCheck, HiLocationMarker } from 'react-icons/hi';
import { Circle, MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { formatAddress, getLocationInfo } from '../shared/lib/location';
import { LocationData } from '../shared/types';

// Fix dla ikon Leaflet w Next.js
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapPickerProps {
  radius: number;
  onLocationSelect: (location: LocationData) => void;
  onClose: () => void;
  initialLocation?: LocationData;
}

function MapClickHandler({ onLocationClick }: { onLocationClick: (latlng: LatLng) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationClick(e.latlng);
    },
  });
  return null;
}

export default function MapPicker({ radius, onLocationSelect, onClose, initialLocation }: MapPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(
    initialLocation ? { lat: initialLocation.latitude, lng: initialLocation.longitude } : null
  );
  const [address, setAddress] = useState<string>('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([52.2297, 21.0122]); // Warszawa jako domyślne

  useEffect(() => {
    if (navigator.geolocation && !initialLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        () => {
        }
      );
    } else if (initialLocation) {
      setMapCenter([initialLocation.latitude, initialLocation.longitude]);
    }
  }, [initialLocation]);

  const handleMapClick = async (latlng: LatLng) => {
    setSelectedLocation({ lat: latlng.lat, lng: latlng.lng });
    setIsLoadingAddress(true);
    
    try {
      const locationInfo = await getLocationInfo(latlng.lat, latlng.lng);
      const addressText = locationInfo ? formatAddress(locationInfo) : `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
      setAddress(addressText);
    } catch {
      setAddress(`${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      const locationData: LocationData = {
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        radius,
        address: address || undefined
      };
      onLocationSelect(locationData);
      onClose();
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Instrukcje */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <HiLocationMarker className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
              Wybierz lokalizację na mapie
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Kliknij na mapę aby wybrać punkt, wokół którego chcesz monitorować loty. 
              Niebieski okrąg pokazuje obszar monitorowania ({radius} km).
            </p>
          </div>
        </div>
      </div>

      {/* Mapa */}
            <div className="h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
        <MapContainer
          center={mapCenter}
          zoom={12}
          style={{ height: '100%', width: '100%', cursor: 'pointer' }}
          className="rounded-xl"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapClickHandler onLocationClick={handleMapClick} />
          
          {selectedLocation && (
            <>
              <Marker 
                position={[selectedLocation.lat, selectedLocation.lng]}
                icon={customIcon}
              />
              <Circle
                center={[selectedLocation.lat, selectedLocation.lng]}
                radius={radius * 1000} 
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.1,
                  weight: 2,
                }}
              />
            </>
          )}
        </MapContainer>
      </div>

      
      {selectedLocation && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-green-800 dark:text-green-200 flex items-center space-x-2">
            <HiLocationMarker className="h-5 w-5" />
            <span>Wybrana lokalizacja</span>
          </h3>
          
          {isLoadingAddress ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              <span className="text-sm text-green-700 dark:text-green-300">Pobieranie adresu...</span>
            </div>
          ) : (
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">
              📍 {address}
            </p>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-2">
              <p className="font-medium text-gray-600 dark:text-gray-400">Szerokość</p>
              <p className="font-mono text-green-700 dark:text-green-300">{selectedLocation.lat.toFixed(6)}</p>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-2">
              <p className="font-medium text-gray-600 dark:text-gray-400">Długość</p>
              <p className="font-mono text-green-700 dark:text-green-300">{selectedLocation.lng.toFixed(6)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Przyciski */}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium order-2 sm:order-1"
        >
          Anuluj
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedLocation}
          className={`flex-1 px-4 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all order-1 sm:order-2 ${
            selectedLocation
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
          }`}
        >
          <HiCheck className="h-5 w-5" />
          <span>Potwierdź lokalizację</span>
        </button>
      </div>
    </div>
  );
}
