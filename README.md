# Travel App Project 

This was my capstone project for Udacity Frontend Nanodegree.

This web app allows users to prepare for their travel with weather and country info.

For this to achieve, the app uses 4 APIs to 
 - determine a the longitude and latitude of the travel destination,
 - get weather info,
 - get info on destination country, and
 - show a picture about the destination.

## Extending the Project Further

Beyond (required) core functionalities, I have implemented the following extra functions:
 - Add end date and display length of trip.
 - Pull in an image for the country from Pixabay API when the entered location brings up no results.
 - Integrate the REST Countries API to pull in data for the country being visited.
 - Instead of just pulling a single day forecast, pull the forecast for multiple days.
 - Displaying multi-day-forecast.

## In this project I have used

- JavaScript
- Node.js, Express, Webpack
- Geonames API, Weatherbit API, Pixabay API and REST Countries API
- Sass styles
- Service workers
- Jest

(If you are interested in dependecies in depth, please check package.json)

## Getting started

- open the project folder
- install the necessary node components by running the following command:
	`npm install`

## Setting up the API

To use this app, you will need an id/key for Geonames API, Weatherbit API and Pixabay API,
and you have to set them as environmental variables.

- Signup for API keys at:
	http://www.geonames.org/export/web-services.html
   https://www.weatherbit.io/account/create
   https://pixabay.com/api/

- Create a new ```.env``` file in the root of the project folder

- Fill the .env file with your API keys like this:

```
GEONAMES_API=**************************
WEATHERBIT_API=**************************
PIXABAY_API=**************************
```

## Launching the app

 - `npm run start`       - for launching server-side code
 - `npm run build-dev`   - for launching client-side code with webpack-dev-server
 - `npm run build-prod`  - to build production version in dist folder, then you can run it with live-server
 - `npm run test`        - for testing with Jest

