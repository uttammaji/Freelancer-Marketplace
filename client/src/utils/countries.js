// client/src/utils/countries.js

/**
 * Countries with states (for location dropdown)
 */
export const countries = [
  {
    name: 'India',
    code: 'IN',
    states: [
      'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
      'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
      'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
      'Uttarakhand', 'West Bengal',
    ],
  },
  {
    name: 'United States',
    code: 'US',
    states: [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
      'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
      'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
      'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
      'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
      'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
      'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
      'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
      'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
    ],
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    states: [
      'England', 'Scotland', 'Wales', 'Northern Ireland',
    ],
  },
  {
    name: 'Australia',
    code: 'AU',
    states: [
      'New South Wales', 'Victoria', 'Queensland', 'Western Australia',
      'South Australia', 'Tasmania', 'Australian Capital Territory',
    ],
  },
  {
    name: 'Canada',
    code: 'CA',
    states: [
      'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
      'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
      'Prince Edward Island', 'Quebec', 'Saskatchewan',
    ],
  },
  {
    name: 'Bangladesh',
    code: 'BD',
    states: [
      'Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet',
      'Barisal', 'Rangpur', 'Mymensingh',
    ],
  },
  {
    name: 'Nepal',
    code: 'NP',
    states: [
      'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim',
      'Province No. 1', 'Province No. 2',
    ],
  },
  {
    name: 'Sri Lanka',
    code: 'LK',
    states: [
      'Western', 'Central', 'Southern', 'Northern', 'Eastern',
      'North Western', 'North Central', 'Uva', 'Sabaragamuwa',
    ],
  },
  {
    name: 'United Arab Emirates',
    code: 'AE',
    states: [
      'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain',
      'Ras Al Khaimah', 'Fujairah',
    ],
  },
  {
    name: 'Singapore',
    code: 'SG',
    states: [
      'Central Region', 'East Region', 'North Region', 'North-East Region', 'West Region',
    ],
  },
];

/**
 * Get country by name
 */
export const getCountryByName = (name) => {
  return countries.find(c => c.name === name);
};

/**
 * Get states for a country
 */
export const getStatesByCountry = (countryName) => {
  const country = countries.find(c => c.name === countryName);
  return country ? country.states : [];
};

/**
 * Common cities for Indian states (simplified)
 */
export const getCitiesByState = (stateName) => {
  const cityMap = {
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Noida'],
    'Delhi': ['New Delhi', 'Dwarka', 'Rohini', 'Saket'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
    'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur'],
    'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar'],
  };

  return cityMap[stateName] || [];
};