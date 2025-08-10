'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { HiCheckCircle, HiCog, HiExclamationCircle, HiMail } from 'react-icons/hi';
import { z } from 'zod';
import { formSchema } from '../shared/lib/validation';
import { FormData, LocationData } from '../shared/types';

type FormValues = z.infer<typeof formSchema>;

interface FlightFormProps {
  onSubmit: (data: FormData) => void;
  location: LocationData | null;
  onRadiusChange?: (radius: number) => void;
}

interface AircraftOptions {
  manufacturers: string[];
  models: string[];
  typeCodes: string[];
  operators: string[];
}

export default function FlightForm({ onSubmit, location, onRadiusChange }: FlightFormProps) {
  // const [aircraftFilters, setAircraftFilters] = useState<AircraftFilter[]>([]);
  // const [aircraftOptions, setAircraftOptions] = useState<AircraftOptions>({
  //   manufacturers: [],
  //   models: [],
  //   typeCodes: [],
  //   operators: [],
  // });
  // const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<Omit<FormValues, 'aircraftFilters'>>({
    resolver: zodResolver(formSchema.omit({ aircraftFilters: true })),
    defaultValues: {
      email: '',
      radius: 5,
    },
    mode: 'onChange',
  });

  const radius = watch('radius');

  // Pobierz opcje samolotów
  useEffect(() => {
    const fetchAircraftOptions = async () => {
      // setIsLoadingOptions(true);
      try {
        const response = await fetch('/api/aircraft-options');
        if (response.ok) {
          const options = await response.json();
          // setAircraftOptions(options);
        }
      } catch (error) {
        console.error('Błąd podczas pobierania opcji samolotów:', error);
      } finally {
        // setIsLoadingOptions(false);
      }
    };

    fetchAircraftOptions();
  }, []);

  const onFormSubmit = (data: Omit<FormValues, 'aircraftFilters'>) => {
    if (!location) {
      return;
    }

    onSubmit({
      email: data.email,
      radius: data.radius,
      location: {
        ...location,
        radius: data.radius,
      },
      // aircraftFilters,
    });
  };

  const isFormValid = isValid && location !== null;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-6'>
      {/* Email Input */}
      <div className='space-y-2'>
        <label htmlFor='email' className='block text-sm font-semibold text-gray-700 dark:text-gray-200'>
          Adres email
        </label>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <HiMail className={`h-5 w-5 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
          </div>
          <input
            id='email'
            type='email'
            placeholder='twoj@email.com'
            className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
              errors.email
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700'
            } dark:text-white`}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <div className='flex items-center space-x-2 text-red-600 dark:text-red-400'>
            <HiExclamationCircle className='h-4 w-4' />
            <p className='text-sm font-medium'>{errors.email.message}</p>
          </div>
        )}
      </div>

      {/* Radius Input */}
      <div className='space-y-2'>
        <label htmlFor='radius' className='block text-sm font-semibold text-gray-700 dark:text-gray-200'>
          Promień wyszukiwania
        </label>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <HiCog className={`h-5 w-5 ${errors.radius ? 'text-red-400' : 'text-gray-400'}`} />
          </div>
          <input
            id='radius'
            type='number'
            min={1}
            max={100}
            className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
              errors.radius
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700'
            } dark:text-white`}
            {...register('radius', {
              valueAsNumber: true,
              onChange: (e) => {
                const value = parseInt(e.target.value);
                if (onRadiusChange && !isNaN(value)) {
                  onRadiusChange(value);
                }
              },
            })}
          />
        </div>

        {errors.radius && (
          <div className='flex items-center space-x-2 text-red-600 dark:text-red-400'>
            <HiExclamationCircle className='h-4 w-4' />
            <p className='text-sm font-medium'>{errors.radius.message}</p>
          </div>
        )}

        <div className='flex items-center justify-between'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Aktualny promień: <span className='font-semibold text-blue-600 dark:text-blue-400'>{radius} km</span>
          </p>
          <div className='px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full'>
            <span className='text-xs font-medium text-blue-800 dark:text-blue-200'>1-100 km</span>
          </div>
        </div>
      </div>

      {/* Currently disable when i will get data from planes */}
      {/* {!isLoadingOptions && (
        <AircraftSelector
          selectedFilters={aircraftFilters}
          onFiltersChange={setAircraftFilters}
          availableOptions={aircraftOptions}
        />
      )} */}

      {/* Submit Button */}
      <div className='space-y-4'>
        {!location && (
          <div className='flex items-center space-x-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl'>
            <HiExclamationCircle className='h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0' />
            <p className='text-sm text-amber-800 dark:text-amber-200 font-medium'>
              Najpierw pobierz swoją lokalizację aby kontynuować
            </p>
          </div>
        )}

        <button
          type='submit'
          disabled={!isFormValid}
          className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform ${
            isFormValid
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-[1.02] shadow-lg hover:shadow-xl focus:ring-4 focus:ring-blue-500/25'
              : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-60'
          }`}
        >
          {isFormValid && <HiCheckCircle className='h-5 w-5' />}
          <span className='text-lg'>Zapisz dane</span>
        </button>
      </div>
    </form>
  );
}
