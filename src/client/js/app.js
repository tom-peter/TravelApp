import { country_names } from './country_names_codes.js'

let projectData = {};

const countryList = new Map(Object.entries(country_names));

// - - - Helper functions - - - 

// Calculating difference between dates
function dateDiff(d1, d2 = '') {
   let date1 = new Date(d1);
   if (d2 === '') d2 = new Date().toISOString().slice(0,10);
   let date2 = new Date(d2);
   return Math.round((date1-date2)/(1000*60*60*24));
}

// Validating form
function formValidation() {
   let errorDiv = document.getElementById('error');
   errorDiv.innerHTML = '';
   let errorNr = 0;
   if (projectData.duration < 0) {
      errorDiv.innerHTML = '<p>The return date should not be earlier than the departure date!</p>'
      errorNr++;
   } 
   if (projectData.countryCode === 'false') {
      errorDiv.innerHTML += '<p>Please select a country!</p>'
      errorNr++;
   }
   return errorNr;
}
 
// - - - Main functions - - - 

// Function called by event listener to POST and update DOM
async function formClick() {
   // getting data from DOM to projectData
   projectData.place = document.getElementById('place').value;
   let e = document.getElementById('country');
   projectData.country = e.options[e.selectedIndex].innerHTML;
   projectData.countryCode = e.options[e.selectedIndex].value;
   projectData.startDate = document.getElementById('startDate').value;
   projectData.endDate = document.getElementById('endDate').value;
   projectData.duration = dateDiff(projectData.endDate, projectData.startDate);
   projectData.daysAway = dateDiff(projectData.startDate);
   // form validation
   if (formValidation() > 0) return;

   console.log(projectData);

   // sending projectData to server, waiting for data, then processing it
   const res = await fetch('http://localhost:9090/travel', {
      method: 'POST', 
      credentials: 'same-origin', 
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData), 
   })
   .then((res) => {        
      let status = res.status;
      res.json()
      .then ((res) => {
         if (status != 200) {            
            throw new Error('Unable to fetch the data');
         }     
         projectData = res;
         console.log(projectData);
      })
      .then(updateUI)            // updating the DOM
   })
   .catch( (error) => {
      console.log(error);
   });
}
 
// Function to update DOM
const updateUI = async () => {
   // Destination info
   document.getElementById('destination').innerHTML = `<span class="bold">Destination:</span> ${projectData.place}, ${projectData.country}`;
   document.getElementById('duration').innerHTML = `<span class="bold">Duration:</span> ${projectData.startDate} - ${projectData.endDate}`;  
   let dur1, dur2;
   if (projectData.duration === 0) {
      dur1 = `less than a day long, `;
   } else if (projectData.duration === 1) {
      dur1 = `1 day long, `;
   } else {
      dur1 = `${projectData.duration} days long, `;
   };
   if (projectData.daysAway === 0) {
      dur2 = `and it starts today!`;
   } else if (projectData.daysAway === 1) {
      dur2 = `and it starts tomorrow!`;
   } else {
      dur2 = `and it is ${projectData.daysAway} days away.`;
   };
   document.getElementById('length').textContent = 'Your trip will be ' + dur1 + dur2;
   // Destination image   
   document.getElementById('imgdiv').innerHTML =
      `<img class="imgplace" src="${projectData.images[0]}">`;
 
   // Weather info   
   let weatherDiv = document.getElementById('w_block');
   if (projectData.weather.length === 0) {
      weatherDiv.innerHTML = 'No weather data for the selected time or place.';
   } else {
      weatherDiv.innerHTML = '<div id = "w_header"><div>Date</div><div>High Temp</div><div>Avg Temp</div><div>Low Temp</div><div>Precip</div></div>';
      projectData.weather.forEach(wData => {
         weatherDiv.innerHTML += 
         `<div class = "w_body"> 
         <div>${wData.date}</div><div>${wData.high_temp}</div><div>${wData.avg_temp}</div>
         <div>${wData.low_temp}</div><div>${wData.precip}</div>
         </div>`;
      })
   }
 
   // Country info
   document.getElementById('countryinfo').innerHTML = 
      `<div class="subheader"><span class="bold">Country info</span></div>
      <div>Population: ${projectData.population}</div>
      <div>Currency: ${projectData.currencyName} (${projectData.currencyCode})</div>
      <div>Language(s): ${projectData.language}</div>
      <div id="flag"><img class="imgflag" src="${projectData.flag}"></div>`;
 
   // Toggle visible sections of the page
   document.getElementById('form').classList.toggle('invisible');
   window.scroll(0,0);   // scroll to the top
   document.getElementById('results').classList.toggle('invisible');
 
   // Console log errors
   if (projectData.errors.length > 0) {
     projectData.errors.forEach(e => console.log(e))
   }
}     // end of updateUI
 
// Function called by event listener to jump back to plan a new trip
function resultClick() {
   document.getElementById('results').classList.toggle('invisible');
   window.scroll(0,0);   // scroll to the top
   document.getElementById('form').classList.toggle('invisible');
}  
 

// Initializing after DOMContentLoaded
function init(){
   // Creating country list options
   const countrySelect = document.getElementById('country')
   countryList.forEach((value, key) => {
      let countryOption = document.createElement('option');
      countryOption.value = value;
      countryOption.innerText = key;
      countrySelect.appendChild(countryOption);
   })
   // Setting the min date for date picking
   document.getElementById('startDate').min = new Date().toISOString().slice(0,10);
   document.getElementById('endDate').min = new Date().toISOString().slice(0,10);
   // Event listeners
   document.getElementById('formButton').addEventListener('click', formClick);
   document.getElementById('resultButton').addEventListener('click', resultClick);
}

export {
   projectData,
   formValidation,
   init
}

