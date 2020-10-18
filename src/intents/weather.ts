import { request, response } from "express";
import * as http from 'http';

//const host = 'api.worldweatheronline.com';
//const wwoApiKey = '3e60dec676e94a88a97112430201810';

const host = 'api.openweathermap.org';
const ApiKey = '483ddfa2413a8028b5b145c7c93c2775';


// Intent name: Huidig weer

export const weather = (conv: any) => {

    //required paramater to get weather info
    let city = conv.parameters.location['city']; 

    //parsing a date if available.
    let date = '';
    if (conv.parameters['date']) { 
      date = conv.parameters['date'];
      console.log('Date: ' + date);
    }


    //let path = '/data/2.5/find' + '?q=' + encodeURIComponent(city) + '&appid=' + ApiKey;
    return callWeatherApi(city, date).then((output) => {
        conv.add(output); // Return the results of the weather API to Dialogflow
      }).catch(() => conv.add(`I don't know the weather but I hope it's good!`));


    }

    
    function callWeatherApi (city: string, date: string) { //voorbeeld functie van https://github.com/dialogflow/fulfillment-weather-nodejs/blob/master/functions/index.js
        return new Promise((resolve, reject) => {
        // Create the path for the HTTP request to get the weather
        let path = '/data/2.5/find' + '?q=' + encodeURIComponent(city) + '&appid=' + ApiKey + '&units=metric&lang=nl';
        console.log('API Request: ' + host + path);
  
      // Make the HTTP request to get the weather
      http.get({host: host, path: path}, (res) => {
        let body = ''; // var to store the response chunks
        res.on('data', (d) => { body += d; }); // store each response chunk
        res.on('end', () => {
          // After all the data has been received parse the JSON for desired data
          let response = JSON.parse(body);
          let forecast = response['list'][0]['main'];
          let location = response['list'][0]['name'];
          let conditions = response['list'][0]['weather'][0];
  
          // Create response
          let output = `op het moment in ${location} 
          is het ${conditions['description']} met een hoog van
          ${forecast['temp_max']}°C en een laag van 
          ${forecast['temp_min']}°C.`;
  
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
};
//test