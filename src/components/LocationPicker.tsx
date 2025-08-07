'use client';

import { lazy, Suspense, useState } from 'react';
import { HiCheckCircle, HiExclamationCircle, HiLocationMarker, HiMap } from 'react-icons/hi';
import Modal from '../shared/components/Modal';
import { formatAddress, getLocationInfo } from '../shared/lib/location';
import { LocationData } from '../shared/types';

const MapPicker = lazy(() => import('@/components/MapPicker'));

interface LocationPickerProps {
  radius: number;
  onLocationChange: (location: LocationData | null) => void;
  location: LocationData | null;
}

export default function LocationPicker({ radius, onLocationChange, location }: LocationPickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const getCurrentLocation = async () => {
    setError('');
    setIsLoading(true);

    if (!navigator.geolocation) {
      setError('Geolokalizacja nie jest wspierana przez twoją przeglądarkę');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Pobierz informacje o adresie
          const locationInfo = await getLocationInfo(latitude, longitude);
          const address = locationInfo ? formatAddress(locationInfo) : undefined;

          const newLocation: LocationData = {
            latitude,
            longitude,
            radius,
            address,
          };

          onLocationChange(newLocation);
        } catch {
          setError('Nie udało się pobrać informacji o adresie');
          onLocationChange({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            radius,
          });
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        let errorMessage = 'Nie udało się pobrać lokalizacji';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Dostęp do lokalizacji został odrzucony';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Informacje o lokalizacji są niedostępne';
            break;
          case error.TIMEOUT:
            errorMessage = 'Czas oczekiwania na lokalizację upłynął';
            break;
        }

        setError(errorMessage);
        setIsLoading(false);
      },
    );
  };

  const handleMapLocationSelect = (selectedLocation: LocationData) => {
    onLocationChange({
      ...selectedLocation,
      radius, // Upewnij się, że używa aktualnego promienia
    });
    setError('');
  };

  return (
    <div className='space-y-4'>
      <div>
        <label className='block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3'>Twoja lokalizacja</label>

        {/* Przyciski wyboru lokalizacji */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          {/* GPS Button */}
          <button
            type='button'
            onClick={getCurrentLocation}
            disabled={isLoading}
            className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              isLoading
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:scale-[1.02]'
            }`}
          >
            {isLoading ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
                <span className='text-sm'>Pobieranie...</span>
              </>
            ) : (
              <>
                <HiLocationMarker className='h-4 w-4' />
                <span className='text-sm'>Moja lokalizacja</span>
              </>
            )}
          </button>

          {/* Map Button */}
          <button
            type='button'
            onClick={() => setIsMapModalOpen(true)}
            className='flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:scale-[1.02] transition-all duration-300'
          >
            <HiMap className='h-4 w-4' />
            <span className='text-sm'>Wybierz z mapy</span>
          </button>
        </div>
      </div>

      {error && (
        <div className='flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl'>
          <HiExclamationCircle className='h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0' />
          <p className='text-sm text-red-800 dark:text-red-200 font-medium'>{error}</p>
        </div>
      )}

      {location && (
        <div className='bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5 space-y-3'>
          <div className='flex items-center space-x-2 mb-3'>
            <HiCheckCircle className='h-5 w-5 text-green-500' />
            <h3 className='font-semibold text-green-800 dark:text-green-200'>Lokalizacja ustawiona</h3>
          </div>

          {location.address && (
            <div className='bg-white/70 dark:bg-gray-800/70 rounded-lg p-3 mb-3'>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>📍 {location.address}</p>
            </div>
          )}

          <div className='grid grid-cols-2 gap-4 text-xs'>
            <div className='bg-white/50 dark:bg-gray-800/50 rounded-lg p-3'>
              <p className='font-medium text-gray-600 dark:text-gray-400'>Szerokość</p>
              <p className='font-mono text-green-700 dark:text-green-300'>{location.latitude.toFixed(6)}</p>
            </div>
            <div className='bg-white/50 dark:bg-gray-800/50 rounded-lg p-3'>
              <p className='font-medium text-gray-600 dark:text-gray-400'>Długość</p>
              <p className='font-mono text-green-700 dark:text-green-300'>{location.longitude.toFixed(6)}</p>
            </div>
          </div>

          <div className='flex items-center justify-center space-x-2 pt-2'>
            <div className='flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full'>
              <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
              <span className='text-xs font-medium text-blue-800 dark:text-blue-200'>
                Promień: {location.radius} km
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal z mapą */}
      <Modal isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} title='Wybierz lokalizację z mapy'>
        <Suspense
          fallback={
            <div className='p-6 flex items-center justify-center h-96'>
              <div className='flex items-center space-x-3'>
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
                <span className='text-gray-600 dark:text-gray-400'>Ładowanie mapy...</span>
              </div>
            </div>
          }
        >
          <MapPicker
            radius={radius}
            onLocationSelect={handleMapLocationSelect}
            onClose={() => setIsMapModalOpen(false)}
            initialLocation={location || undefined}
          />
        </Suspense>
      </Modal>
    </div>
  );
}
