import { Parser } from "n3";

export const buildVilleStationProps = async (turtleData) => {
  const parser = new Parser();
  const quads = parser.parse(turtleData);
  // Dictionnaire pour stocker les associations stationId => ville
  const villeStationProps = {};

  // Parcours des quads pour extraire les informations nécessaires
  quads.forEach(({ subject, predicate, object }) => {
    const stationId = subject.value.split("/").pop(); // Extrait l'ID de la station
    const key = predicate.value.split("#").pop(); // Utilise la partie après "#" comme clé

    // Si le quad contient l'information sur la ville (en fonction de la structure des données Turtle)
    if (key === "ville") {
      const ville = object.value; // La valeur associée à la ville
      villeStationProps[stationId] = ville; // Ajoute au dictionnaire
    }
  });

  return villeStationProps;
};

export const filterWeatherData = async (
  turtleData,
  selectedStationId,
  targetDate
) => {
  const parser = new Parser();
  const quads = parser.parse(turtleData);

  const filteredData = {}; // Object to store filtered data by station

  // Helper function to parse a Turtle dateTime literal
  const parseDateTime = (dateTimeLiteral) => {
    try {
      const dateString = dateTimeLiteral.split("^^")[0].replace(/"/g, "");
      const year = parseInt(dateString.slice(0, 4), 10);
      const month = parseInt(dateString.slice(4, 6), 10) - 1; // Months are zero-based
      const day = parseInt(dateString.slice(6, 8), 10);
      const hour = parseInt(dateString.slice(8, 10), 10);
      const minute = parseInt(dateString.slice(10, 12), 10);
      const second = parseInt(dateString.slice(12, 14), 10);
      return new Date(year, month, day, hour, minute, second);
    } catch (error) {
      console.error("Error parsing dateTime literal:", dateTimeLiteral, error);
      return null;
    }
  };

  // Helper function to check if a date matches the target date
  const isMatchingDate = (recordDate, targetDate) => {
    return (
      recordDate.getFullYear() === targetDate.getFullYear() &&
      recordDate.getMonth() === targetDate.getMonth() &&
      recordDate.getDate() === targetDate.getDate()
    );
  };

  // Iterate over all quads to extract and filter data
  quads.forEach(({ subject, predicate, object }) => {
    const stationId = subject.value.split("/").pop(); // Extract station ID
    const key = predicate.value.split("#").pop(); // Extract property name

    // Skip if station ID doesn't match
    if (selectedStationId && stationId !== selectedStationId) return;

    // Parse dateTime values
    let recordDateTime = null;
    if (key === "dateTime") {
      recordDateTime = parseDateTime(object.value);
      if (!recordDateTime) return; // Skip invalid dates

      // Ensure the date matches the target date
      if (targetDate && !isMatchingDate(recordDateTime, targetDate)) return;

      // Initialize station data if not already done
      if (!filteredData[stationId]) {
        filteredData[stationId] = [];
      }

      // Check if a record already exists for this dateTime
      let currentRecord = filteredData[stationId].find(
        (record) => record.dateTime.getTime() === recordDateTime.getTime()
      );

      // If no record exists for this dateTime, create a new one
      if (!currentRecord) {
        currentRecord = {
          dateTime: recordDateTime,
          stationId,
        };
        filteredData[stationId].push(currentRecord);
      }
    } else {
      // If not dateTime, ensure we're working with a valid station and date
      if (!filteredData[stationId]) return;

      const latestRecord = filteredData[stationId].at(-1);
      if (!latestRecord) return;

      // Parse and assign values based on the key
      let value = object.value.split("^^")[0].replace(/"/g, ""); // Strip datatype
      if (
        [
          "temperature",
          "humidity",
          "max",
          "min",
          "pressure",
          "visibility",
          "wind",
          "dewPoint",
        ].includes(key)
      ) {
        value = parseFloat(value);
      }

      // Map keys to appropriate fields
      switch (key) {
        case "temperature":
          latestRecord.temperature = value - 273.15;
          break;
        case "humidity":
          latestRecord.humidity = value;
          break;
        case "max":
          latestRecord.max = value - 273.15;
          break;
        case "min":
          latestRecord.min = value - 273.15;
          break;
        case "pressure":
          latestRecord.pressure = value;
          break;
        case "visibility":
          latestRecord.visibility = value;
          break;
        case "wind":
          latestRecord.wind = value;
          break;
        case "dewPoint":
          latestRecord.dewPoint = value - 273.15;
          break;
        case "ville":
          latestRecord.ville = value;
          break;
        default:
          console.warn(`Unhandled key "${key}" for station ${stationId}`);
          latestRecord[key] = value; // Store any other unhandled properties
          break;
      }
    }
  });

  // Format filtered data for easier consumption
  const formattedData = Object.keys(filteredData).flatMap((stationId) =>
    filteredData[stationId].map((record) => ({
      address: stationId,
      ville: record.ville || "Unknown",
      dateTime: record.dateTime || new Date(),
      temperature: record.temperature || null,
      max: record.max || null,
      min: record.min || null,
      humidity: record.humidity || null,
      pressure: record.pressure || null,
      visibility: record.visibility || null,
      wind: record.wind || null,
      dewPoint: record.dewPoint || null,
    }))
  );

  return formattedData;
};
