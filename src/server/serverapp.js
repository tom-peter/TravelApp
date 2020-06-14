var path = require('path')
require('dotenv').config();

let projectData = {};
const geoNamesUrl = `http://api.geonames.org/searchJSON?username=${process.env.GEONAMES_API}&maxRows=5&orderby=relevance`;
const weatherbitUrl = `https://api.weatherbit.io/v2.0/forecast/daily?key=${process.env.WEATHERBIT_API}`;
const pixabayUrl = `https://pixabay.com/api/?key=${process.env.PIXABAY_API}&image_type=photo`;
const restCountriesUrl = 'https://restcountries.eu/rest/v2/name/'; 

// Require Express to run server and routes and start up an instance of app
const express = require('express');
const app = express();

// Require and use dependencies
const cors = require('cors');
const bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const axios = require('axios');

// - - - Helper functions - - - 

// Calculating difference between dates
function dateDiff(d1, d2 = '') {
   let date1 = new Date(d1);
   if (d2 === '') d2 = new Date().toISOString().slice(0,10);
   let date2 = new Date(d2);
   return Math.round((date1-date2)/(1000*60*60*24));
}

// Selecting weather data
function selectWeatherData(wData, start, end) {
   let diffStart;
   let diffEnd;
   wData.forEach(data => {
      diffStart = dateDiff(data.valid_date, start);
      diffEnd = dateDiff(end, data.valid_date);
      if (diffStart >= 0 && diffEnd >= 0 ) {
         projectData.weather.push({
            'date' : data.valid_date,
            'avg_temp' : `${Math.round(data.temp)}°C`,
            'high_temp' : `${Math.round(data.high_temp)}°C`,
            'low_temp' : `${Math.round(data.low_temp)}°C`,
            'precip' : `${Math.round(data.precip)} mm`,
         });
      }     
   })
}

// Selecting images to projectData
function selectImageData(iData) {
   let i = 0;
   while ( i < 3 && i < iData.totalHits) {
      projectData.images.push(iData.hits[i].webformatURL);
      i++;
   }
}

// Selecting country data to projectData
function selectCountryData(cData) {
   projectData.population = (cData.population / 1000000).toFixed(1) + ' million';
   projectData.currencyName = cData.currencies[0].name;
   projectData.currencyCode = cData.currencies[0].code;
   projectData.language = '';
   cData.languages.forEach(e => { 
      if (projectData.language != '') projectData.language += ', ';
      projectData.language += e.name;
   });
   projectData.flag = cData.flag;
}

// - - - Main function - - - 

// POST route - calling all APIs and sending the data to the client side
app.post('/travel', async (req, res) => {

   projectData = req.body;
   projectData.encodedPlace = encodeURIComponent(projectData.place).replace('%20','+').replace('\'','%27');
   projectData.encodedCountry = encodeURIComponent(projectData.country).replace('\'','%27');
   projectData.weather = [];
   projectData.images = [];
   projectData.errors = [];

   let t0 = new Date().getTime();      // to measure API calls time

   // GeoNames API
   let geoResponse = await axios.get(`${geoNamesUrl}&name=${projectData.encodedPlace}&country=${projectData.countryCode}`)
   .then((res) => {
      if (res.data.totalResultsCount > 0) {
         projectData.lon = res.data.geonames[0].lng;
         projectData.lat = res.data.geonames[0].lat;
         return true;
      } else {
         projectData.errors.push('GeoNames API error: No results found.')
         return false;
      }
   })
   .catch((error) => {
      projectData.errors.push(`GeoNames API error: ${error.message}`)
      return false;
   })   

   let weatherbitParam;
   if (geoResponse) {
      weatherbitParam = `${weatherbitUrl}&lat=${projectData.lat}&lon=${projectData.lon}`;
   } else {
      weatherbitParam = `${weatherbitUrl}&city=${projectData.encodedPlace}&country=${projectData.countryCode}`;
   }

   // the other 3 APIs will be called parallel, with Promise.all
   // Putting the axios network requests into an array 

   let promiseArray = [ 
      // Weatherbit API
      axios.get(weatherbitParam)
      .then((res) => {
         if (res.status === 204) throw new Error('204 - No content.');
         selectWeatherData(res.data.data, projectData.startDate, projectData.endDate);
         return true;
      })
      .catch((error) => {
         projectData.errors.push(`Weatherbit API error: ${error.message}`)
         return false;
      }),

      // Pixabay API
      axios.get(`${pixabayUrl}&q=${projectData.encodedPlace}+${projectData.encodedCountry}`)
      .then(async (res) => {
         if (res.data.totalHits === 0) {
            let imgResponse2 = await axios.get(`${pixabayUrl}&q=${projectData.encodedCountry}`)
            .then((res2) => {
               if (res2.data.totalHits === 0) throw new Error('No hits.');
               selectImageData(res2.data);
               return true;
            })
            .catch((error) => {
               projectData.errors.push(`Pixabay API error: ${error.message}`)
               return false;
            })   
            return (imgResponse2 ? true : false);
         } else {
            selectImageData(res.data);
            return true;
         }            
      })
      .catch((error) => {
         projectData.errors.push(`Pixabay API error: ${error.message}`)
         return false;
      }),

      // REST Countries API
      axios.get(`${restCountriesUrl}${projectData.encodedCountry}`)
      .then((res) => {
         selectCountryData(res.data[0]);
         return true;
      })
      .catch((error) => {
         projectData.errors.push(`REST Countries API error: ${error.message}`)
         return false;
      })  
   ]     // end of network requests array

// run all 3 network requests parallel with handling the errors separately
// + waiting for all 3 to finish
   let [weatherResponse, imgResponse, countryResponse] = 
      await Promise.all(promiseArray.map(p => p.catch(e => e)));

   let t1 = new Date().getTime() - t0;     // to measure API calls time
   console.log(t1, 'ms');
   console.log('Errors: ', projectData.errors);
   console.log('POST');

   return res.send(projectData);
});

exports.app = app;
exports.dateDiff = dateDiff;
