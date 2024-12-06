import React, { useState } from "react";

interface WeatherProps {
  address: string;
  ville: string;
  dateTime: Date;
  temperature: number;
  max: number;
  min: number;
  humidity: number;
  pressure: number;
  visibility: number;
  wind: number;
  dewPoint: number;
}

const WeatherCard: React.FC<WeatherProps[]> = (weatherData) => {
  // État pour suivre l'intervalle sélectionné
  const [selectedInterval, setSelectedInterval] = useState(0);
  const dataArray = Object.values(weatherData);

  // Données du créneau sélectionné
  const currentData = dataArray[selectedInterval];

  // Fonction de formatage de l'heure
  const formatHour = (date: Date): string => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fonction pour trouver un index valide en parcourant les indices voisins
  const findValidIndex = (
    index: number,
    dataArray: WeatherProps[],
    direction: number,
    field: keyof WeatherProps
  ): number => {
    let i = index + direction;
    while (i >= 0 && i < dataArray.length) {
      if (dataArray[i][field] !== undefined) {
        return i; // Trouvé un index avec une valeur valide
      }
      i += direction;
    }
    return -1; // Aucun index valide trouvé
  };

  // Fonction d'approximation des valeurs (température, pression, vent, etc.)
  // Fonction d'approximation des valeurs (température, pression, vent, etc.)
  const approximateValue = (
    index: number,
    dataArray: WeatherProps[],
    field: keyof WeatherProps
  ): string => {
    const previousIndex = findValidIndex(index, dataArray, -1, field);
    const nextIndex = findValidIndex(index, dataArray, 1, field);

    if (previousIndex === -1 && nextIndex === -1) {
      return "N/A"; // Aucun index valide trouvé
    }

    const previousValue =
      previousIndex !== -1 ? dataArray[previousIndex][field] : null;
    const nextValue = nextIndex !== -1 ? dataArray[nextIndex][field] : null;

    // Vérification si les valeurs précédentes et suivantes sont valides
    if (
      previousValue !== null &&
      previousValue !== undefined &&
      nextValue !== null &&
      nextValue !== undefined
    ) {
      return (((previousValue as number) + (nextValue as number)) / 2).toFixed(
        2
      );
    } else if (previousValue !== null && previousValue !== undefined) {
      return (previousValue as number).toFixed(2);
    } else if (nextValue !== null && nextValue !== undefined) {
      return (nextValue as number).toFixed(2);
    }

    return "N/A"; // Si aucune valeur n'est trouvée
  };

  // Fonctions spécifiques pour chaque champ météo
  const approximateTemperature = (index: number) => {
    return approximateValue(index, dataArray, "temperature");
  };

  const approximatePressure = (index: number) => {
    return approximateValue(index, dataArray, "pressure");
  };

  const approximateWind = (index: number) => {
    return approximateValue(index, dataArray, "wind");
  };

  const approximateHumidity = (index: number) => {
    return approximateValue(index, dataArray, "humidity");
  };

  const approximateVisibility = (index: number) => {
    return approximateValue(index, dataArray, "visibility");
  };

  const approximateDewPoint = (index: number) => {
    return approximateValue(index, dataArray, "dewPoint");
  };

  const approximateMax = (index: number) => {
    return approximateValue(index, dataArray, "max");
  };

  const approximateMin = (index: number) => {
    return approximateValue(index, dataArray, "min");
  };

  // Fonction qui vérifie si une valeur est définie avant d'appeler `toFixed()`
  const safeToFixed = (value: number | null | undefined) => {
    return value != null ? value.toFixed(2) : "N/A"; // Vérifie si la valeur est ni null ni undefined
  };

  return (
    <div className="max-w-4xl bg-gray-50 border border-gray-200 rounded-lg shadow-md p-6 mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-gray-700 font-semibold text-lg">
          Météo aujourd&apos;hui à {currentData.ville}
        </h2>
        <div className="mt-4">
          <p className="text-6xl font-bold text-gray-800">
            {currentData.temperature
              ? safeToFixed(currentData.temperature)
              : approximateTemperature(selectedInterval)}{" "}
            ° C
          </p>
          <p className="text-sm text-gray-500 mt-1">T. ressentie</p>
        </div>
      </div>

      {/* Sélecteur d'intervalle */}
      <div className="flex justify-between items-center mb-6 overflow-x-auto">
        {dataArray.map((data, index) => (
          <button
            key={index}
            onClick={() => setSelectedInterval(index)}
            className={`text-center px-4 py-2 border rounded-lg 
              ${
                index === selectedInterval
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
          >
            <p className="text-sm font-medium">{formatHour(data.dateTime)}</p>
            <p className="text-base font-semibold">
              {data.temperature
                ? safeToFixed(data.temperature)
                : approximateTemperature(index)}{" "}
              ° C
            </p>
          </button>
        ))}
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 text-gray-700">
        <div>
          <p className="text-sm font-medium text-gray-500">Max. / Min.</p>
          <p className="text-base">
            {currentData.max
              ? safeToFixed(currentData.max)
              : approximateMax(selectedInterval)}{" "}
            °C /{" "}
            {currentData.min
              ? safeToFixed(currentData.min)
              : approximateMin(selectedInterval)}{" "}
            °C
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Vent</p>
          <p className="text-base">
            {currentData.wind
              ? safeToFixed(currentData.wind)
              : approximateWind(selectedInterval)}{" "}
            km/h
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Humidité</p>
          <p className="text-base">
            {currentData.humidity
              ? safeToFixed(currentData.humidity)
              : approximateHumidity(selectedInterval)}{" "}
            %
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Point de rosée</p>
          <p className="text-base">
            {currentData.dewPoint
              ? safeToFixed(currentData.dewPoint)
              : approximateDewPoint(selectedInterval)}{" "}
            ° C
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Pression</p>
          <p className="text-base">
            {currentData.pressure
              ? (currentData.pressure / 100).toFixed(2)
              : (Number(approximatePressure(selectedInterval)) / 100).toFixed(
                  2
                )}{" "}
            hPa
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Visibilité</p>
          <p className="text-base">
            {currentData.visibility
              ? (currentData.visibility / 1000).toFixed(2)
              : (
                  Number(approximateVisibility(selectedInterval)) / 1000
                ).toFixed(2)}{" "}
            km
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
