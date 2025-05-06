import './index.css';
import { useEffect, useState } from 'react';

function App() {
  const [search, setSearch] = useState("chennai");
  const [city, setCity] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [isCelsius, setIsCelsius] = useState(true);
  const [airQuality, setAirQuality] = useState(null);


  const API_KEY = "7db7f4dc24f41ff2956b0ddce4ddf5da";

  const toggleUnit = () => setIsCelsius(prev => !prev);
  const convertToFahrenheit = c => (c * 9) / 5 + 32;
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      getWeatherData();
    }
  };

  const getWeatherData = async (lat = null, lon = null) => {
    try {
      let weatherUrl, forecastUrl;

      if (lat && lon) {
        weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
      } else {
        weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${search}&appid=${API_KEY}&units=metric`;
        forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${search}&appid=${API_KEY}&units=metric`;
      }

      const [weatherRes, forecastRes] = await Promise.all([
        fetch(weatherUrl),
        fetch(forecastUrl)
      ]);

      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();
      setCity(weatherData);

      const dailyForecast = forecastData.list.filter(r => r.dt_txt.includes("12:00:00"));
      setForecast(dailyForecast);

      const latUsed = weatherData.coord.lat;
      const lonUsed = weatherData.coord.lon;

      const [airRes, uvRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${latUsed}&lon=${lonUsed}&appid=${API_KEY}`),
        fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${latUsed}&lon=${lonUsed}&appid=${API_KEY}`)
      ]);

      const airData = await airRes.json();
      const uvData = await uvRes.json();

      setAirQuality(airData.list[0]);
      setUvIndex(uvData.value);

    } catch (err) {
      console.error("Error fetching weather data:", err);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          getWeatherData(coords.latitude, coords.longitude);
        },
        (err) => {
          console.error(err);
          getWeatherData();
        }
      );
    } else {
      getWeatherData();
    }
  }, []);

  const displayedTemp = city?.main?.temp
    ? isCelsius
      ? `${city.main.temp}°C`
      : `${convertToFahrenheit(city.main.temp).toFixed(1)}°F`
    : "--";

  const feelsLikeTemp = city?.main?.feels_like
    ? isCelsius
      ? `${city.main.feels_like}°C`
      : `${convertToFahrenheit(city.main.feels_like).toFixed(1)}°F`
    : "--";

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="App">
      <div className="weather-card">
        <div className="search">
          <input
            type="search"
            placeholder="Enter city name"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button onClick={() => getWeatherData()}>
            <i className="fas fa-search"></i>
          </button>
        </div>

        <div className="weather">
          <div className="weather-header">
            <div>
              <h2>Current weather</h2>
              <div className="time">{currentTime}</div>
            </div>
          </div>
          <div className="unit-text">
                <label className="switch">
                <input type="checkbox" checked={!isCelsius} onChange={toggleUnit} />
                <span className="slider">
                  <span className="thumb">{isCelsius ? "°C" : "°F"}</span>
                </span>
              </label>
             </div>
             <h2 className="city">{city?.name || "--"}</h2>


          <div className="weather-main">
            
            <div className="weather-info">
              <h1 className="temp">{displayedTemp}</h1>
              <div className="condition">{city?.weather?.[0]?.main || "--"}</div>
              <div className="feels-like">Feels like {feelsLikeTemp}</div>
            </div>
          </div>
          {city?.weather && (
              <div className="weather-icon">
                <img
                  src={`https://openweathermap.org/img/wn/${city.weather[0].icon}@4x.png`}
                  alt={city.weather[0].description}
                />
              </div>
            )}
          

          <div className="weather-description">
            {city?.weather?.[0]?.description
              ? `Expect ${city.weather[0].description}. The high will reach ${displayedTemp} on this humid day.`
              : "--"}
          </div>

          <div className="details">
            <div className="detail-item">
              <span>Air quality</span>
              <span>{airQuality?.main?.aqi || "--"}</span>
            </div>
            <div className="detail-item">
              <span>Wind</span>
              <span>{city?.wind?.speed || "--"} km/h <span className="wind-direction">↗</span></span>
            </div>
            <div className="detail-item">
              <span>Humidity</span>
              <span>{city?.main?.humidity || "--"}%</span>
            </div>
            
            <div className="detail-item">
              <span>Pressure</span>
              <span>{city?.main?.pressure || "--"} mb</span>
            </div>
            
          </div>

          <div className="unit-toggle">
           
          </div>

        </div>

        <div className="forecast">
          <div className="forecast-grid">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-item">
                <p>{new Date(day.dt_txt).toLocaleDateString()}</p>
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt={day.weather[0].description}
                />
                <p>
                  {isCelsius
                    ? `${day.main.temp.toFixed(1)}°C`
                    : `${convertToFahrenheit(day.main.temp).toFixed(1)}°F`}
                </p>
                <p>{day.weather[0].main}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;