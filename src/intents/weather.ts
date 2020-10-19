import { response } from 'express';
import * as http from 'http';
const axios = require('axios');

const openweathermap = new Map ();
openweathermap.set('host', 'http://api.openweathermap.org/data/2.5/find')
openweathermap.set('apiKey', '483ddfa2413a8028b5b145c7c93c2775')


const geocode = new Map ();
geocode.set('host', 'https://geocode.xyz/')
geocode.set('apiKey', '146630500381958569682x18325')


// Intent name: Huidig weer
export const weather = (conv: any) => {

    //required paramater to get weather info
    let city = conv.parameters['geo-city'];
    if (!city){
        return conv.add('Hier is het wel lekker weer! Waar zit jij?')
    }
    
    //getting further data on the city eg lattitude & longtitude
    getGeo(city).then((cityOutput) => {
        const cityData = cityOutput;
    }).catch(() => console.log('error in getting geodata'));
    
    

    //parsing a date if available.
    let date = '';
    if (conv.parameters['date']) { 
      date = conv.parameters['date'];
      console.log('Date: ' + date);
    }

    return callWeatherApi(city).then((output) => {
        conv.add(output); // Return the results of the weather API to Dialogflow
    }).catch(() => conv.add(`Oei! Ik kan het weer niet vinden maar ik hoop dat het zonnig is!`));


}
function callWeatherApi (city: string){
    return new Promise((resolve, reject) => {
        const params = {
            q: encodeURIComponent(city),
            appid: openweathermap.get('apiKey'),
            units: 'metric',
            lang: 'nl'
        }
        
        axios.get(openweathermap.get('host'), {params})
            .then((response: { data: any; }) => {
                let forecast = response.data['list'][0]['main'];
                let location = response.data['list'][0]['name'];
                let conditions = response.data['list'][0]['weather'][0];
        
                // Create response
                let output = `op het moment in ${location} 
                is het ${conditions['description']} met een hoog van
                ${forecast['temp_max']}°C en een laag van 
                ${forecast['temp_min']}°C.`;
      
                // Resolve the promise with the output text
                console.log(output);
                resolve(output);
            }).catch((error: any) => {
                console.log(`Error calling the weather API: ${error}`)
                reject();
        });
    });
}

function getGeo (city: string){
    return new Promise((resolve, reject) => {
        const params = {
            auth: geocode.get('apiKey'),
            locate: city,
            json: '1'
        }
        
        axios.get(geocode.get('host'), {params})
            .then((response: { data: any; }) => {
            console.log(response.data['longt']);
            resolve(response.data);
            }).catch((error: any) => {
            reject(error);
            });
    });
}