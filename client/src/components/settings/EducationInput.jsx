// client/src/components/settings/EducationInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, GraduationCap, ChevronDown, Calendar } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export function EducationInput({ 
  educationList = [], 
  onAddEducation, 
  onRemoveEducation,
  maxEducation = 5 
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [field, setField] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const formRef = useRef(null);

  const currentYear = new Date().getFullYear();

  // Close form on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) {
        setIsFormOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddEducation = () => {
    if (!institution.trim()) return;
    if (educationList.length >= maxEducation) return;

    const educationData = {
      institution: institution.trim(),
      degree: degree.trim(),
      field: field.trim(),
      startYear: startYear ? Number(startYear) : undefined,
      endYear: endYear ? Number(endYear) : undefined,
    };

    onAddEducation(educationData);
    
    // Reset form
    setInstitution('');
    setDegree('');
    setField('');
    setStartYear('');
    setEndYear('');
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Education
        </label>
        <span className="text-[11px] text-slate-400">
          {educationList.length}/{maxEducation}
        </span>
      </div>

      {/* Education List */}
      {educationList.length > 0 && (
        <div className="space-y-2">
          {educationList.map((edu, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {edu.institution}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {[edu.degree, edu.field].filter(Boolean).join(' in ') || 'Degree not specified'}
                    {edu.startYear && ` • ${edu.startYear}${edu.endYear ? ` - ${edu.endYear}` : ' - Present'}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveEducation(index)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                aria-label="Remove education"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Education Button */}
      {educationList.length < maxEducation && (
        <div className="relative" ref={formRef}>
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:border-primary-400 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Education
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isFormOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Education Form */}
          {isFormOpen && (
            <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-soft-lg p-4 space-y-3">
              <Input
                label="Institution"
                placeholder="Brainware University"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Degree"
                  placeholder="B.Tech"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                />
                <Input
                  label="Field of Study"
                  placeholder="Computer Science"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Start Year
                  </label>
                  <select
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: currentYear - 1970 + 1 }, (_, i) => currentYear - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    End Year
                  </label>
                  <select
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    disabled={!startYear}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
                  >
                    <option value="">Present</option>
                    {startYear && Array.from({ length: currentYear - Number(startYear) + 1 }, (_, i) => Number(startYear) + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                className="w-full"
                onClick={handleAddEducation}
                disabled={!institution.trim()}
              >
                Add Education
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}