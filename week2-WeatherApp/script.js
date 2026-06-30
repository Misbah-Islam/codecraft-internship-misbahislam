const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const errorMsg = document.getElementById('errorMsg');
const weatherCard = document.getElementById('weatherCard');
const recentList = document.getElementById('recentList');
const themeToggle = document.getElementById('themeToggle');
const dateTimeEl = document.getElementById('dateTime');

// ---- Date & Time ----
function updateDateTime() {
  const now = new Date();
  dateTimeEl.textContent = now.toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
updateDateTime();
setInterval(updateDateTime, 60000);

// ---- Theme Toggle ----
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  themeToggle.textContent = '☀️';
}
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// ---- Weather Code to Icon/Condition mapping (Open-Meteo) ----
function getWeatherInfo(code) {
  const map = {
    0: ['Clear Sky', '☀️'], 1: ['Mainly Clear', '🌤️'], 2: ['Partly Cloudy', '⛅'],
    3: ['Overcast', '☁️'], 45: ['Fog', '🌫️'], 48: ['Fog', '🌫️'],
    51: ['Light Drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Dense Drizzle', '🌧️'],
    61: ['Light Rain', '🌧️'], 63: ['Rain', '🌧️'], 65: ['Heavy Rain', '🌧️'],
    71: ['Light Snow', '🌨️'], 73: ['Snow', '🌨️'], 75: ['Heavy Snow', '❄️'],
    80: ['Rain Showers', '🌦️'], 81: ['Rain Showers', '🌧️'], 82: ['Violent Showers', '⛈️'],
    95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm + Hail', '⛈️'], 99: ['Severe Storm', '⛈️']
  };
  return map[code] || ['Unknown', '❓'];
}

// ---- Recent Searches ----
function loadRecent() {
  const recent = JSON.parse(localStorage.getItem('recentCities')) || [];
  recentList.innerHTML = '';
  recent.forEach(city => {
    const span = document.createElement('span');
    span.textContent = city;
    span.addEventListener('click', () => fetchWeather(city));
    recentList.appendChild(span);
  });
}
function saveRecent(city) {
  let recent = JSON.parse(localStorage.getItem('recentCities')) || [];
  recent = recent.filter(c => c.toLowerCase() !== city.toLowerCase());
  recent.unshift(city);
  if (recent.length > 5) recent.pop();
  localStorage.setItem('recentCities', JSON.stringify(recent));
  loadRecent();
}

// ---- Fetch Weather ----
async function fetchWeather(city) {
  errorMsg.classList.add('hidden');
  weatherCard.classList.add('hidden');

  try {
    // Step 1: Get coordinates from city name
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      errorMsg.classList.remove('hidden');
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // Step 2: Get weather data
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`);
    const weatherData = await weatherRes.json();
    const current = weatherData.current;

    const [condition, icon] = getWeatherInfo(current.weather_code);

    document.getElementById('cityName').textContent = `${name}, ${country}`;
    document.getElementById('weatherIcon').src = `https://twemoji.maxcdn.com/v/latest/72x72/${icon.codePointAt(0).toString(16)}.png`;
    document.getElementById('weatherIcon').onerror = function(){ this.style.display='none'; };
    document.getElementById('temperature').textContent = `${Math.round(current.temperature_2m)}°C`;
    document.getElementById('condition').textContent = `${icon} ${condition}`;
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('wind').textContent = `${current.wind_speed_10m} km/h`;

    weatherCard.classList.remove('hidden');
    saveRecent(name);
  } catch (err) {
    errorMsg.classList.remove('hidden');
  }
}

searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) fetchWeather(city);
});
cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchBtn.click();
});

loadRecent();