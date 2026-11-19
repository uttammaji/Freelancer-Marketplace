// client/src/utils/languages.js

/**
 * Complete list of languages for dropdown
 */
export const languages = [
  { name: 'English', code: 'en' },
  { name: 'Hindi', code: 'hi' },
  { name: 'Bengali', code: 'bn' },
  { name: 'Tamil', code: 'ta' },
  { name: 'Telugu', code: 'te' },
  { name: 'Marathi', code: 'mr' },
  { name: 'Gujarati', code: 'gu' },
  { name: 'Kannada', code: 'kn' },
  { name: 'Malayalam', code: 'ml' },
  { name: 'Punjabi', code: 'pa' },
  { name: 'Urdu', code: 'ur' },
  { name: 'Spanish', code: 'es' },
  { name: 'French', code: 'fr' },
  { name: 'German', code: 'de' },
  { name: 'Chinese', code: 'zh' },
  { name: 'Japanese', code: 'ja' },
  { name: 'Korean', code: 'ko' },
  { name: 'Arabic', code: 'ar' },
  { name: 'Russian', code: 'ru' },
  { name: 'Portuguese', code: 'pt' },
  { name: 'Italian', code: 'it' },
  { name: 'Dutch', code: 'nl' },
  { name: 'Turkish', code: 'tr' },
  { name: 'Vietnamese', code: 'vi' },
  { name: 'Thai', code: 'th' },
  { name: 'Indonesian', code: 'id' },
  { name: 'Swedish', code: 'sv' },
  { name: 'Norwegian', code: 'no' },
  { name: 'Danish', code: 'da' },
  { name: 'Finnish', code: 'fi' },
];

/**
 * Language proficiency levels (matching backend enum)
 */
export const proficiencyLevels = [
  { value: 'basic', label: 'Basic' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'native', label: 'Native' },
];

/**
 * Get language name by code
 */
export const getLanguageName = (code) => {
  const lang = languages.find(l => l.code === code);
  return lang ? lang.name : code;
};

/**
 * Get proficiency label by value
 */
export const getProficiencyLabel = (value) => {
  const level = proficiencyLevels.find(l => l.value === value);
  return level ? level.label : value;
};