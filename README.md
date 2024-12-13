# Weather Data Viewer

**Weather Data Viewer** est une application web construite avec **Next.js** permettant de visualiser les données météorologiques stockées dans une base de données Turtle locale. L'application récupère les informations à l'aide de requêtes SPARQL et les affiche de manière simple et claire sur l'interface web.

## Fonctionnalités

- **Visualisation des données météo** : Affiche les données météorologiques (température, humidité, précipitations, etc.) extraites d'une base de données Turtle locale.
- **Interface simple et interactive** : Développée avec **Next.js**, l'application propose une interface facile à utiliser pour consulter les données.
- **Requêtes SPARQL** : L'application effectue des requêtes SPARQL pour récupérer les informations météorologiques de la base de données.

## Prérequis

Avant de démarrer l'application, vous devez avoir installé les éléments suivants :

- **Node.js** (version 16 ou plus récente)
- **npm** (inclus avec Node.js)
- Un serveur SPARQL (par exemple **Apache Jena Fuseki**) hébergeant la base de données Turtle locale.

## Installation

1. Clonez ce repository sur votre machine :

   ```bash
   git clone https://github.com/votre-utilisateur/weather-data-viewer.git
   cd weather-data-viewer
   
2. Installez les dépendances du projet :

   ```bash
    npm install

3. Lancez l'application en mode développement :

   ```bash
   npm run dev


