import { Parser } from "n3";
import * as RDF from "rdflib";

export const buildVilleStationPropsSPARQL = async (turtleData) => {
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

export const filterWeatherDataSPARQL = async (
  turtleData,
  selectedStationId,
  targetDate
) => {
  const store = RDF.graph(); // Crée un graphe RDF vide

  // Utilise la méthode parse de rdflib pour charger les données Turtle dans le store RDF
  RDF.parse(turtleData, store, "http://example.com/weather/", "text/turtle");

  // Crée une requête SPARQL pour extraire les données filtrées
  const query = `
    PREFIX ex: <http://example.org/weather#>
    PREFIX xsd: <https://www.w3.org/2001/XMLSchema-datatypes>
    
    SELECT ?station ?dateTime ?temperature ?humidity ?pressure ?wind ?dewPoint ?ville
    WHERE {
      ?station a ex:Station .
      ?station ex:dateTime ?dateTime .
      ?station ex:temperature ?temperature .
      ?station ex:humidity ?humidity .
      ?station ex:pressure ?pressure .
      ?station ex:wind ?wind .
      ?station ex:dewPoint ?dewPoint .
      ?station ex:ville ?ville .
      
      FILTER(?station = ex:${selectedStationId}) 
      FILTER(STRDT(?dateTime, xsd:string) = "${targetDate
        .toISOString()
        .slice(0, 19)
        .replace("T", "")}")
    }
  `;

  // Exécute la requête SPARQL sur le store RDF
  const results = store.query(query);

  // Formate les résultats pour les utiliser
  const formattedData = results.map((result) => ({
    stationId: result.station.value.split("/").pop(), // Extrait l'ID de la station
    dateTime: new Date(result.dateTime.value),
    temperature: parseFloat(result.temperature.value) - 273.15, // Convertit la température de Kelvin à Celsius
    humidity: parseInt(result.humidity.value),
    pressure: parseFloat(result.pressure.value),
    wind: parseFloat(result.wind.value),
    dewPoint: parseFloat(result.dewPoint.value) - 273.15, // Convertit le point de rosée de Kelvin à Celsius
    ville: result.ville.value,
  }));

  return formattedData;
};
