'use client';

import { useState } from 'react';
import { HiChevronDown, HiChevronUp, HiSearch, HiX } from 'react-icons/hi';

export interface AircraftFilter {
  manufacturername?: string;
  model?: string;
  typecode?: string;
  operator?: string;
}

export interface AircraftOption {
  manufacturername: string;
  model: string;
  typecode: string;
  operator: string;
}

interface AircraftSelectorProps {
  selectedFilters: AircraftFilter[];
  onFiltersChange: (filters: AircraftFilter[]) => void;
  availableOptions: {
    manufacturers: string[];
    models: string[];
    typeCodes: string[];
    operators: string[];
  };
}

export default function AircraftSelector({ selectedFilters, onFiltersChange, availableOptions }: AircraftSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'manufacturer' | 'model' | 'type' | 'operator'>('manufacturer');

  const addFilter = (type: keyof AircraftFilter, value: string) => {
    const newFilter: AircraftFilter = { [type]: value };
    if (!selectedFilters.some(filter => filter[type] === value)) {
      onFiltersChange([...selectedFilters, newFilter]);
    }
  };

  const removeFilter = (index: number) => {
    const newFilters = selectedFilters.filter((_, i) => i !== index);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange([]);
  };

  const getFilteredOptions = (options: string[], type: keyof AircraftFilter) => {
    return options
      .filter(option => 
        option && option.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedFilters.some(filter => filter[type] === option)
      )
      .slice(0, 50) // Ograniczamy do 50 opcji dla wydajności
      .sort();
  };

  const tabs = [
    { id: 'manufacturer' as const, label: 'Producent', options: availableOptions.manufacturers },
    { id: 'model' as const, label: 'Model', options: availableOptions.models },
    { id: 'type' as const, label: 'Typ', options: availableOptions.typeCodes },
    { id: 'operator' as const, label: 'Operator', options: availableOptions.operators },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
          Filtry samolotów
        </label>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <span>{isExpanded ? 'Zwiń' : 'Rozwiń'}</span>
          {isExpanded ? <HiChevronUp className="h-4 w-4" /> : <HiChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Selected Filters */}
      {selectedFilters.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Wybrane filtry ({selectedFilters.length})
            </span>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Wyczyść wszystkie
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedFilters.map((filter, index) => {
              const filterType = Object.keys(filter)[0] as keyof AircraftFilter;
              const filterValue = filter[filterType];
              const typeLabels = {
                manufacturername: 'Producent',
                model: 'Model',
                typecode: 'Typ',
                operator: 'Operator'
              };
              
              return (
                <div
                  key={index}
                  className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                >
                  <span className="font-medium">{typeLabels[filterType]}:</span>
                  <span>{filterValue}</span>
                  <button
                    type="button"
                    onClick={() => removeFilter(index)}
                    className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <HiX className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expanded Selector */}
      {isExpanded && (
        <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Szukaj..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-sm dark:text-white"
            />
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto space-y-1">
            {getFilteredOptions(
              tabs.find(tab => tab.id === activeTab)?.options || [],
              activeTab === 'manufacturer' ? 'manufacturername' :
              activeTab === 'model' ? 'model' :
              activeTab === 'type' ? 'typecode' : 'operator'
            ).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => addFilter(
                  activeTab === 'manufacturer' ? 'manufacturername' :
                  activeTab === 'model' ? 'model' :
                  activeTab === 'type' ? 'typecode' : 'operator',
                  option
                )}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
              >
                {option}
              </button>
            ))}
          </div>

          {getFilteredOptions(
            tabs.find(tab => tab.id === activeTab)?.options || [],
            activeTab === 'manufacturer' ? 'manufacturername' :
            activeTab === 'model' ? 'model' :
            activeTab === 'type' ? 'typecode' : 'operator'
          ).length === 0 && (
            <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Brak wyników dla tego wyszukiwania' : 'Brak dostępnych opcji'}
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      {!isExpanded && selectedFilters.length === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Kliknij &ldquo;Rozwiń&rdquo; aby wybrać konkretne samoloty, które Cię interesują
        </p>
      )}
    </div>
  );
}
