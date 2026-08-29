// client/src/components/settings/SkillInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import { getAllSkills } from '../../services/skill.service';
import { X, Plus, Check, Search } from 'lucide-react';

export function SkillInput({ 
  selectedSkills = [], 
  onAddSkill, 
  onRemoveSkill,
  maxSkills = 20 
}) {
  const [availableSkills, setAvailableSkills] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Fetch skills from backend
  useEffect(() => {
    const loadSkills = async () => {
      setIsLoading(true);
      try {
        const response = await getAllSkills();
        if (response.success) {
          setAvailableSkills(response.skills || []);
        }
      } catch (error) {
        console.error('Failed to load skills:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSkills();
  }, []);

  // Filter suggestions on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = availableSkills.filter(skill => {
        const skillName = typeof skill === 'string' ? skill : skill.name;
        return skillName.toLowerCase().includes(inputValue.toLowerCase()) &&
               !selectedSkills.includes(skillName);
      });
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, availableSkills, selectedSkills]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) && 
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddSkill = (skillName) => {
    if (selectedSkills.length >= maxSkills) {
      return;
    }
    if (!selectedSkills.includes(skillName)) {
      onAddSkill(skillName);
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddSkill(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && selectedSkills.length > 0) {
      onRemoveSkill(selectedSkills[selectedSkills.length - 1]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Skills
        </label>
        <span className="text-[11px] text-slate-400">
          {selectedSkills.length}/{maxSkills}
        </span>
      </div>

      {/* Selected Skills Tags */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSkills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded-lg border border-primary-200 dark:border-primary-800"
            >
              {skill}
              <button
                type="button"
                onClick={() => onRemoveSkill(skill)}
                className="hover:text-rose-500 transition-colors"
                aria-label={`Remove ${skill}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input with Autocomplete */}
      <div className="relative" ref={inputRef}>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Type skill name and press Enter..."
            disabled={selectedSkills.length >= maxSkills}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-soft-lg max-h-48 overflow-y-auto"
          >
            {suggestions.map((skill, index) => {
              const skillName = typeof skill === 'string' ? skill : skill.name;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAddSkill(skillName)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300">{skillName}</span>
                  <Plus className="w-4 h-4 text-slate-400" />
                </button>
              );
            })}
          </div>
        )}

        {/* No suggestions */}
        {showSuggestions && inputValue && suggestions.length === 0 && !isLoading && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
            <p className="text-xs text-slate-400 text-center">
              No matching skills. Press Enter to add "{inputValue}"
            </p>
          </div>
        )}
      </div>

      {/* Popular Skills Quick Add */}
      {selectedSkills.length < maxSkills && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] text-slate-400 font-semibold mt-1 mr-1">Popular:</span>
          {availableSkills.slice(0, 8).map((skill, index) => {
            const skillName = typeof skill === 'string' ? skill : skill.name;
            const isSelected = selectedSkills.includes(skillName);
            if (isSelected) return null;
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleAddSkill(skillName)}
                className="px-2 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/40 transition-colors"
              >
                + {skillName}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}