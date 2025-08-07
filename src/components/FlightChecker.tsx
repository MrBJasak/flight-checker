'use client';

import FlightForm from '@/components/FlightForm';
import LocationPicker from '@/components/LocationPicker';
import ThemeToggle from '@/shared/components/ThemeToggle';
import axios from 'axios';
import { useState } from 'react';
import { HiOutlinePaperAirplane } from 'react-icons/hi2';
import { useToast } from '../shared/hooks/useToast';
import { FormData, LocationData } from '../shared/types';

export default function FlightChecker() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [currentRadius, setCurrentRadius] = useState(5);
  const toast = useToast();

  const handleFormSubmit = async (data: FormData) => {
    
    if (!data.location) {
      toast.error('Proszę wybrać lokalizację na mapie przed zapisaniem subskrypcji.');
      return;
    }

    try {
      await axios.post('/api/subscribe', {
        email: data.email,
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        radius: data.radius,
      });

      toast.success(`Subskrypcja została utworzona pomyślnie!\n\nEmail: ${data.email}\nLokalizacja: ${data.location.address || 'Brak adresu'}\nPromień: ${data.radius} km\n\nBędzie otrzymywać powiadomienia o nowych samolotach w tej okolicy.`);
      setLocation(null);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message?.includes('already subscribed')) {
        alert(`⚠️ Ten email jest już zarejestrowany w systemie.\n\nJeśli chcesz zmienić parametry, najpierw usuń poprzednią subskrypcją.`);
      } else if (axios.isAxiosError(error) && error.response?.data?.message) {
        alert(`❌ Błąd: ${error.response.data.message}`);
      } else {
        toast.error('Wystąpił błąd podczas zapisywania subskrypcji. Spróbuj ponownie.');
      }
    }
  };

  const handleLocationChange = (newLocation: LocationData | null) => {
    setLocation(newLocation);
  };

  const handleRadiusChange = (newRadius: number) => {
    setCurrentRadius(newRadius);
    if (location) {
      setLocation(prev => prev ? { ...prev, radius: newRadius } : null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-blue-900 dark:to-violet-900 flex items-center justify-center p-4 relative overflow-hidden">
      <ThemeToggle />
      
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200/30 dark:bg-blue-500/20 rounded-full blur-xl animate-bounce-slow"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200/30 dark:bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-cyan-200/30 dark:bg-cyan-500/20 rounded-full blur-lg animate-bounce"></div>
      
      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8 animate-fade-in">
          <div className="relative mb-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg shadow-blue-500/25 animate-bounce-slow">
              <HiOutlinePaperAirplane className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full"></div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 animate-gradient">
            Flight Checker
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
            Monitoruj loty w Twojej okolicy
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl shadow-blue-500/10 border border-white/20 dark:border-gray-700/50 p-8 transition-all duration-500 hover:shadow-3xl hover:shadow-blue-500/20 animate-slide-up">
          <div className="space-y-8">
            <FlightForm 
              onSubmit={handleFormSubmit} 
              location={location}
              onRadiusChange={handleRadiusChange}
            />
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <LocationPicker
                radius={currentRadius}
                onLocationChange={handleLocationChange}
                location={location}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
