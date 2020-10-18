import { request, response } from "express";
import * as http from 'http';

const host = 'api.worldweatheronline.com';
const wwoApiKey = '3e60dec676e94a88a97112430201810';

// Intent name: Huidig weer

export const weather = (conv: any) => {
    let city = conv.parameters.location['city'];
    let date = '';
    if (conv.parameters['date']) {
      date = conv.parameters['date'];
      console.log('Date: ' + date);
    }


    return conv.add(
        date
    )
    
}
/*
    function callWeatherApi (city, date) { //voorbeeld functie van https://github.com/dialogflow/fulfillment-weather-nodejs/blob/master/functions/index.js
        return new Promise((resolve, reject) => {
        // Create the path for the HTTP request to get the weather
        let path = '/premium/v1/weather.ashx?format=json&num_of_days=1' +
            '&q=' + encodeURIComponent(city) + '&key=' + wwoApiKey + '&date=' + date;
        console.log('API Request: ' + host + path);
  
      // Make the HTTP request to get the weather
      http.get({host: host, path: path}, (res) => {
        let body = ''; // var to store the response chunks
        res.on('data', (d) => { body += d; }); // store each response chunk
        res.on('end', () => {
          // After all the data has been received parse the JSON for desired data
          let response = JSON.parse(body);
          let forecast = response['data']['weather'][0];
          let location = response['data']['request'][0];
          let conditions = response['data']['current_condition'][0];
          let currentConditions = conditions['weatherDesc'][0]['value'];
  
          // Create response
          let output = `Current conditions in the ${location['type']} 
          ${location['query']} are ${currentConditions} with a projected high of
          ${forecast['maxtempC']}°C or ${forecast['maxtempF']}°F and a low of 
          ${forecast['mintempC']}°C or ${forecast['mintempF']}°F on 
          ${forecast['date']}.`;
  
          // Resolve the promise with the output text
          console.log(output);
          resolve(output);
        });
        res.on('error', (error) => {
          console.log(`Error calling the weather API: ${error}`)
          reject();
        });
      });
    });

}*/