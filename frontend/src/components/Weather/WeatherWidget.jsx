import React, { useState, useEffect } from "react";
import { obtenerClimaPorCiudad } from "../../api/weatherAPI";

export default function WeatherWidget() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        // Intentar obtener ubicación del usuario
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async () => {
              // Para simplificar, usaremos Lima por defecto
              const data = await obtenerClimaPorCiudad("Lima,PE");
              setWeatherData(data);
              setLoading(false);
            },
            async () => {
              // Si no se puede obtener ubicación, usar Lima por defecto
              const data = await obtenerClimaPorCiudad("Lima,PE");
              setWeatherData(data);
              setLoading(false);
            }
          );
        } else {
          // Si no hay geolocalización, usar Lima por defecto
          const data = await obtenerClimaPorCiudad("Lima,PE");
          setWeatherData(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error al cargar clima:", err);
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div className="bg-orange-500/20 backdrop-blur-sm rounded-lg p-3 mb-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          <span className="ml-2 text-orange-200 text-sm">Cargando clima...</span>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <div className="bg-orange-500/20 backdrop-blur-sm rounded-lg p-3 mb-4 border border-orange-500/30">
      <div className="flex items-center justify-between text-white">
        <div className="flex items-center">
          <div className="text-2xl mr-2">🌤️</div>
          <div>
            <div className="font-semibold text-orange-200">
              {weatherData.name}, {weatherData.sys?.country}
            </div>
            <div className="text-sm text-orange-300 capitalize">
              {weatherData.weather?.[0]?.description}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-200">
            {Math.round(weatherData.main?.temp)}°C
          </div>
          <div className="text-xs text-orange-300">
            Sensación: {Math.round(weatherData.main?.feels_like)}°C
          </div>
        </div>
      </div>
    </div>
  );
}
