"use client";

import { buildVilleStationProps, filterWeatherData } from "@/parser/parser";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { useEffect, useState } from "react";
import WeatherCard from "../components/WeatherCard";

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

interface VilleStation {
  [stationId: string]: string;
}

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherProps[]>();
  const [date, setDate] = useState<Date>();
  const [ville, setVille] = useState<string>();
  const [error, setError] = useState<string>();
  const [villeStation, setVilleStation] = useState<VilleStation>();

  // Dates limite
  const minDate = new Date("2024-08-01"); // 1er août 2024
  const maxDate = new Date("2024-11-22"); // 22 novembre 2024

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("weather-data.ttl");
        const turtleData = await response.text();
        const villeStationProps: VilleStation = (await buildVilleStationProps(
          turtleData
        )) as VilleStation;
        setVilleStation(villeStationProps);
      } catch (error) {
        console.error("Erreur lors du chargement des données météo :", error);
      }
    };

    fetchData();
  }, []);

  const resetData = () => {
    setWeatherData(undefined);
    setVille(undefined);
    setDate(undefined);
    setError(undefined);
  };

  const handleVerifOk = async () => {
    if (ville && date) {
      try {
        // Récupère l'ID de la station à partir du dictionnaire villeStation en fonction de la ville sélectionnée
        const selectedStationId = villeStation
          ? Object.keys(villeStation).find(
              (stationId) => villeStation[stationId] === ville
            )
          : undefined;

        if (!selectedStationId) {
          setError("Station non trouvée pour cette ville.");
          return;
        }
        const response = await fetch("weather-data.ttl");
        const turtleData = await response.text();
        // Utilise filterWeatherData pour récupérer les données filtrées par ville et date
        const filteredWeatherData = await filterWeatherData(
          turtleData,
          selectedStationId,
          date
        );

        if (!filteredWeatherData) {
          setError(
            "Aucune donnée météo trouvée pour cette ville et cette date. Les données météo sont disponibles entre Août 2024 et Novembre 2024."
          );
          return;
        }

        // Si des données sont trouvées, on met à jour le state avec la donnée sélectionnée
        setWeatherData(filteredWeatherData);
      } catch (error) {
        console.error("Erreur lors de la recherche des données météo :", error);
        setError(
          "Une erreur est survenue lors de la recherche des données météo."
        );
      }
    }
  };

  if (villeStation && !weatherData) {
    return (
      <div className="flex items-center h-screen w-full justify-around flex-col">
        <div className="flex w-full justify-center space-x-10 flex-row">
          <Dropdown
            value={ville} // Lier directement à `ville`
            onChange={(e) => setVille(e.value)} // Utiliser `e.value` pour mettre à jour `ville`
            options={Object.values(villeStation || {}).map((ville) => ({
              label: ville, // Nom de la ville
              value: ville, // Ville comme valeur sélectionnée
            }))}
            placeholder="Choisissez une ville"
            panelClassName="bg-gray-50 mt-2"
            className="max-w-md text-center w-full md:w-14rem border border-gray-300 rounded-lg shadow-lg p-2"
            showClear
          />

          <Calendar
            value={date}
            placeholder="Date"
            onChange={(e) => setDate(e.value || new Date())}
            panelClassName="bg-gray-50 mt-4"
            className="max-w-xs text-center w-full md:w-14rem border bg-white p-2 border-gray-300 rounded-lg shadow-lg"
            minDate={minDate}
            maxDate={maxDate}
            dateTemplate={(date) => {
              const dateObj = new Date(date.year, date.month, date.day);
              const isDisabled = dateObj < minDate || dateObj > maxDate;
              return (
                <span
                  className={isDisabled ? "p-disabled" : ""}
                  style={isDisabled ? { color: "#ccc" } : {}}
                >
                  {date.day}
                </span>
              );
            }}
          />
        </div>
        <Button
          onClick={handleVerifOk}
          label="Ok"
          className="bg-gray-50 border p-2 px-20 hover:bg-gray-100 rounded-xl"
        />
        {error && <div className="text-red-500">{error}</div>}
      </div>
    );
  }

  if (!weatherData) {
    return <></>;
  }

  return (
    <div className="flex flex-col justify-around items-center h-screen">
      <WeatherCard {...weatherData} />
      <Button
        onClick={resetData}
        label="Retour"
        className="bg-gray-50 border p-2 px-20 hover:bg-gray-100 rounded-xl"
      />
    </div>
  );
}
