'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HiOutlineXCircle, HiOutlinePaperAirplane } from 'react-icons/hi2';
import axios from 'axios';
import { useToast } from '../../shared/hooks/useToast';
import ThemeToggle from '../../shared/components/ThemeToggle';

export default function UnsubscribePage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Proszę podać adres email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Proszę podać prawidłowy adres email');
      return;
    }

    setIsLoading(true);

    try {
      await axios.post('/api/unsubscribe', { email });
      
      setIsSuccess(true);
      toast.success(`Subskrypcja dla ${email} została pomyślnie anulowana!`);
      setEmail('');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error === 'EMAIL_NOT_FOUND') {
        toast.error('Ten email nie jest zarejestrowany w systemie');
      } else if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(`Błąd: ${error.response.data.message}`);
      } else {
        toast.error('Wystąpił błąd podczas anulowania subskrypcji. Spróbuj ponownie.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900 dark:to-orange-900 flex items-center justify-center p-4">
        <ThemeToggle />
        
        <div className="relative w-full max-w-md">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg shadow-green-500/25 mb-4">
              <HiOutlineXCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-green-600 dark:text-green-400 mb-4">
              Gotowe!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Twoja subskrypcja została pomyślnie anulowana.
            </p>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Nie będziesz już otrzymywać powiadomień o samolotach w Twojej okolicy.
            </p>
            
            <button
              onClick={() => setIsSuccess(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Anuluj inną subskrypcję
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900 dark:to-orange-900 flex items-center justify-center p-4 relative overflow-hidden">
      <ThemeToggle />
      
      {/* Decorative circles */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-red-200/30 dark:bg-red-500/20 rounded-full blur-xl animate-bounce-slow"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-orange-200/30 dark:bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-200/30 dark:bg-yellow-500/20 rounded-full blur-lg animate-bounce"></div>
      
      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="relative mb-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-orange-600 rounded-full shadow-lg shadow-red-500/25 animate-bounce-slow">
              <HiOutlineXCircle className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 rounded-full animate-ping"></div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 rounded-full"></div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Anuluj Subskrypcję
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
            Wprowadź email aby anulować powiadomienia
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-2xl shadow-red-500/10 border border-white/20 dark:border-gray-700/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adres Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twoj@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                disabled={isLoading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-red-500/25 transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Anulowanie...
                </>
              ) : (
                <>
                  <HiOutlineXCircle className="w-5 h-5" />
                  Anuluj Subskrypcję
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Po anulowaniu nie będziesz już otrzymywać powiadomień o samolotach w Twojej okolicy.
            </p>
          </div>
        </div>

        {/* Link to main page */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <HiOutlinePaperAirplane className="w-4 h-4" />
            Powróć do Flight Checker
          </Link>
        </div>
      </div>
    </div>
  );
}
