import { response } from 'express';
const axios = require('axios');

const openweathermap = new Map();
openweathermap.set('host', 'https://api.openweathermap.org/data/2.5/onecall')
openweathermap.set('apiKey', '483ddfa2413a8028b5b145c7c93c2775')


const geocode = new Map();
geocode.set('host', 'https://geocode.xyz/')
geocode.set('apiKey', '146630500381958569682x18325')


// Intent name: Huidig weer
export const weather = (conv: any) => {

    //required paramater to get weather info
    let city = conv.parameters['geo-city'];
    if (!city) {
        return conv.add('Hier is het wel lekker weer! Waar zit jij?')
    }

    //parsing a date if available.
    let date = '';
    if (conv.parameters['date']) {
        date = conv.parameters['date'];
        console.log('Date: ' + date);
    }
    //getting further data on the city eg lattitude & longtitude
    console.log('Im amout to grab geo data!')
    return getGeo(city).then((cityOutput) => {
        let cityData = cityOutput;
        console.log('Im amout to grab weather data!')
        return callWeatherApi(cityData).then((output) => {
            conv.add(output); // Return the results of the weather API to Dialogflow
        }).catch(() => conv.add(`Oei! Ik kan het weer niet vinden maar ik hoop dat het zonnig is!`));
    }).catch(() => console.log('error in getting geodata'));


}
function callWeatherApi(cityData: any) {
    console.log('Im grabbing weather data!')
    return new Promise((resolve, reject) => {
        const params = {
            lat: cityData['latt'],
            lon: cityData['longt'],
            appid: openweathermap.get('apiKey'),
            units: 'metric',    
            lang: 'nl'
        }

        axios.get(openweathermap.get('host'), { params })
            .then((response: { data: any; }) => {
                let forecast = response.data['current'];
                let conditions = response.data['current']['weather'][0];

                // Create response
                let output = `op het moment in ${cityData['standard']['city']} 
                is het ${conditions['description']} met een tempratuur van
                ${forecast['temp']}°C en een windsnelheid van
                ${forecast['wind_speed']} knopen.`;

                // Resolve the promise with the output text
                console.log(output);
                console.log('Im done grabbing weather data!')
                resolve(output);
            }).catch((error: any) => {
                console.log(`Error calling the weather API: ${error}`)
                reject();
            });
    });
}

function getGeo(city: string) {
    console.log('Im grabbing geo data!')
    return new Promise((resolve, reject) => {
        const params = {
            auth: geocode.get('apiKey'),
            locate: city,
            json: '1'
        }
        axios.get(geocode.get('host'), { params })
            .then((response: { data: any; }) => {
                console.log(response.data);
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
    });
}