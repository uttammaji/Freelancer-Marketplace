// client/src/components/settings/LocationSelect.jsx
import React, { useState, useEffect } from 'react';
import { countries, getStatesByCountry, getCitiesByState } from '../../utils/countries';
import { MapPin, ChevronDown } from 'lucide-react';

export function LocationSelect({ 
  value = { country: '', state: '', city: '' },
  onChange 
}) {
  const [country, setCountry] = useState(value.country || '');
  const [state, setState] = useState(value.state || '');
  const [city, setCity] = useState(value.city || '');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  //  Sync when value prop changes (after profile loads)
  useEffect(() => {
    if (value.country) {
      setCountry(value.country);
      setStates(getStatesByCountry(value.country));
    }
    if (value.state) {
      setState(value.state);
      setCities(getCitiesByState(value.state));
    }
    if (value.city) {
      setCity(value.city);
    }
  }, [value]);

  // Update parent when location changes
  useEffect(() => {
    onChange({ country, state, city });
  }, [country, state, city]);

  // Update states when country changes
  useEffect(() => {
    if (country) {
      setStates(getStatesByCountry(country));
    } else {
      setStates([]);
    }
  }, [country]);

  // Update cities when state changes
  useEffect(() => {
    if (state) {
      setCities(getCitiesByState(state));
    } else {
      setCities([]);
    }
  }, [state]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-slate-400" />
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Location
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Country Dropdown */}
        <div className="relative">
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setState('');
              setCity('');
            }}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none cursor-pointer pr-10"
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c.code} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* State Dropdown */}
        <div className="relative">
          <select
            value={state}
            onChange={(e) => {
              setState(e.target.value);
              setCity('');
            }}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none cursor-pointer pr-10 disabled:opacity-50"
            disabled={!country}
          >
            <option value="">{country ? 'Select State' : 'Select Country First'}</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* City Dropdown */}
        <div className="relative">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none cursor-pointer pr-10 disabled:opacity-50"
            disabled={!state}
          >
            <option value="">{state ? 'Select City' : 'Select State First'}</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Selected location summary */}
      {(country || state || city) && (
        <p className="text-[11px] text-slate-400">
          Selected: {[city, state, country].filter(Boolean).join(', ')}
        </p>
      )}
    </div>
  );
}