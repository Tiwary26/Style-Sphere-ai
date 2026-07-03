const axios = require('axios');

// Map WMO codes to weather conditions
const parseWmoCode = (code) => {
  if (code === 0) return { type: 'Clear', condition: 'Sunny' };
  if (code >= 1 && code <= 3) return { type: 'Cloudy', condition: 'Partly Cloudy' };
  if (code >= 51 && code <= 67) return { type: 'Rainy', condition: 'Drizzle' };
  if (code >= 71 && code <= 77) return { type: 'Snowy', condition: 'Snow' };
  if (code >= 80 && code <= 82) return { type: 'Rainy', condition: 'Rain Showers' };
  if (code >= 95 && code <= 99) return { type: 'Stormy', condition: 'Thunderstorm' };
  return { type: 'Moderate', condition: 'Cloudy' };
};

// Recommends clothing categories and seasons based on weather variables
const getWeatherOutfitRules = (temp, isRain, windSpeed) => {
  let recommendedSeason = 'All-Season';
  let categories = [];
  let reasons = [];

  if (temp < 15) {
    recommendedSeason = 'Winter';
    categories = ['Jackets', 'Hoodies', 'Pants', 'Jeans'];
    reasons.push('It is cold outside. Layering with a jacket or hoodie is highly recommended.');
  } else if (temp >= 15 && temp <= 24) {
    recommendedSeason = 'Spring';
    categories = ['Shirts', 'T-Shirts', 'Jeans', 'Pants', 'Kurti'];
    reasons.push('The weather is mild and pleasant. Light shirts or Kurti are ideal.');
  } else {
    recommendedSeason = 'Summer';
    categories = ['T-Shirts', 'Shirts', 'Dresses', 'Kurti', 'Pants'];
    reasons.push('It is warm outside. Choose light breathable clothing like T-Shirts or Dresses.');
  }

  if (isRain) {
    categories.push('Accessories'); // e.g., Umbrella
    reasons.push('It is raining! Make sure to take an umbrella or waterproof accessory.');
  }

  if (windSpeed > 15) {
    categories.push('Jackets');
    reasons.push('Windy weather conditions. A windbreaker or jacket will keep you warm.');
  }

  return { recommendedSeason, categories, reasons };
};

const getWeatherData = async (lat, lon, city = '') => {
  // If coordinates are provided, fetch from Open-Meteo (completely keyless and free)
  if (lat && lon) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain,weather_code,wind_speed_10m&timezone=auto`;
      const response = await axios.get(url);
      
      const current = response.data.current;
      const temp = current.temperature_2m;
      const isRain = current.rain > 0;
      const windSpeed = current.wind_speed_10m;
      const weatherInfo = parseWmoCode(current.weather_code);

      const rules = getWeatherOutfitRules(temp, isRain, windSpeed);

      return {
        success: true,
        source: 'Live (Open-Meteo)',
        city: city || 'Current Location',
        temp,
        condition: weatherInfo.condition,
        weatherType: weatherInfo.type,
        isRain,
        windSpeed,
        recommendations: rules,
      };
    } catch (error) {
      console.error('Open-Meteo API error, falling back to mock weather:', error.message);
    }
  }

  // High-quality simulated fallback
  const mockTemp = 28; // Default Summer Temperature
  const mockRain = false;
  const mockWind = 8;
  const rules = getWeatherOutfitRules(mockTemp, mockRain, mockWind);

  return {
    success: true,
    source: 'Simulated',
    city: city || 'Default Location (Mumbai)',
    temp: mockTemp,
    condition: 'Sunny & Clear',
    weatherType: 'Clear',
    isRain: mockRain,
    windSpeed: mockWind,
    recommendations: rules,
  };
};

module.exports = {
  getWeatherData,
};
