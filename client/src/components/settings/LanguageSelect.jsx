// client/src/components/settings/LanguageSelect.jsx
import React, { useState, useEffect, useRef } from 'react';
import { languages, proficiencyLevels } from '../../utils/languages';
import { X, Plus, Check, Globe, ChevronDown } from 'lucide-react';
import { Button } from '../common/Button';

export function LanguageSelect({ 
  selectedLanguages = [], 
  onAddLanguage, 
  onRemoveLanguage,
  maxLanguages = 5 
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedProficiency, setSelectedProficiency] = useState('conversational');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter languages
  const filteredLanguages = languages.filter(lang => 
    lang.name.toLowerCase().includes(languageSearch.toLowerCase()) &&
    !selectedLanguages.some(sl => sl.name === lang.name)
  );

  const handleAddLanguage = () => {
    if (!selectedLanguage) return;
    if (selectedLanguages.length >= maxLanguages) return;

    const languageData = {
      name: selectedLanguage.name,
      code: selectedLanguage.code,
      level: selectedProficiency,
    };

    onAddLanguage(languageData);
    setSelectedLanguage(null);
    setLanguageSearch('');
    setSelectedProficiency('conversational');
    setIsDropdownOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Languages
        </label>
        <span className="text-[11px] text-slate-400">
          {selectedLanguages.length}/{maxLanguages}
        </span>
      </div>

      {/* Selected Languages */}
      {selectedLanguages.length > 0 && (
        <div className="space-y-2">
          {selectedLanguages.map((lang, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {lang.name}
                  </p>
                  <p className="text-[11px] text-slate-400 capitalize">
                    {lang.level}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveLanguage(lang.name)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                aria-label={`Remove ${lang.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Language Section */}
      {selectedLanguages.length < maxLanguages && (
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:border-primary-400 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Language
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown - Fixed z-index */}
          {isDropdownOpen && (
            <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-soft-lg p-4 space-y-3">
              {/* Search */}
              <input
                type="text"
                placeholder="Search language..."
                value={languageSearch}
                onChange={(e) => setLanguageSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />

              {/* Language List */}
              <div className="max-h-32 overflow-y-auto space-y-1">
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLanguage(lang);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedLanguage?.code === lang.code
                          ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{lang.name}</span>
                      {selectedLanguage?.code === lang.code && (
                        <Check className="w-4 h-4 text-primary-600" />
                      )}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-3">
                    No languages found
                  </p>
                )}
              </div>

              {/* Proficiency Level */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  Proficiency Level
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {proficiencyLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProficiency(level.value);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        selectedProficiency === level.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Language Display */}
              {selectedLanguage && (
                <p className="text-xs text-slate-400 text-center">
                  Selected: <span className="font-semibold text-slate-600 dark:text-slate-300">{selectedLanguage.name}</span> ({selectedProficiency})
                </p>
              )}

              {/* Add Button */}
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddLanguage();
                }}
                disabled={!selectedLanguage}
              >
                Add Language
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}