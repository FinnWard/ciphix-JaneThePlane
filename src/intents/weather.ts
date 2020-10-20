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
    console.log(conv.parameters);
    //required paramater to get weather info
    let city = conv.parameters['geo-city'];
    if (!city){
        return conv.add('Hier is het wel lekker weer! Waar zit jij?')
    }

    //parsing a date if available.
    let dateTime = new Date();
    console.log(dateTime);
    if (conv.parameters['date-time']) {
        dateTime = new Date(conv.parameters['date-time']);
    }
    //getting further data on the city eg lattitude & longtitude
    console.log('Im amout to grab geo data!')
    return getGeo(city).then((cityOutput) => {
        let cityData = cityOutput;
        console.log('Im amout to grab weather data!')
        return callWeatherApi(cityData,dateTime).then((output) => {
            conv.add(output); // Return the results of the weather API to Dialogflow
        }).catch(() => conv.add(`Oei! Ik kan het weer niet vinden maar ik hoop dat het zonnig is!`));
    }).catch(() => console.log('error in getting geodata'));


}
function callWeatherApi(cityData: any,dateTime: Date) {
    console.log('Im grabbing weather data!')
    console.log(dateTime)
    
    return new Promise((resolve, reject) => {
        const params = {
            lat: cityData['latt'],
            lon: cityData['longt'],
            appid: openweathermap.get('apiKey'),
            units: 'metric',
            lang: 'nl'
        };

        axios.get(openweathermap.get('host'), { params })
            .then((response: { data: any; }) => {
                
                let unixDateTime : any;
                unixDateTime = (dateTime.getTime() / 1000).toFixed(0);
                //checking if we have also recieved a timestamp. 
                if(unixDateTime){
                    let closestDate = 0; // we will store the closest date here as we iterate
                    for (var i =0; i< response.data['hourly'].length ;i++) {// as we have hourly and daily date we will need to loop twice.
                        if (Math.abs(unixDateTime - response.data['hourly'][i]['dt']) < Math.abs(unixDateTime - closestDate)){
                            closestDate = response.data['hourly'][i]['dt'];
                        }   
                        console.log(closestDate);               
                    };
                    for (var i =0; i< response.data['daily'].length ;i++) {
                        if (Math.abs(unixDateTime - response.data['daily'][i]['dt']) < Math.abs(unixDateTime - closestDate)){
                            closestDate = response.data['daily'][i]['dt'];
                        }  
                        console.log(closestDate);
                    }

                    // now that we have the closest timestamp to the ask lets find the index. we will first check the hourly dataset
                    let indexClosestDate;
                    let hourlyDaily = 'hourly';
                    indexClosestDate = response.data['hourly'].map(function(e: { dt: any; }) { return e.dt; }).indexOf(closestDate);
                    let forecastTemp = response.data[hourlyDaily][indexClosestDate]; //need to diclare this before as the format changes with hourly/daily

                    // if the index is still NULL the closest date will be in the days
                    if(indexClosestDate){
                        indexClosestDate = response.data['daily'].map(function(e: { dt: any; }) { return e.dt; }).indexOf(closestDate);
                        hourlyDaily = 'daily';
                        forecastTemp = response.data[hourlyDaily][indexClosestDate]['temp']['day'];
                    }
                    console.log(indexClosestDate + hourlyDaily);
                    
                    //now we know where the data is in the dataset we can start filling out our responses
                    let forecastWind = response.data[hourlyDaily][indexClosestDate]['wind_speed'];
                    let conditions = response.data[hourlyDaily][indexClosestDate]['weather'][0];
                    let readableDate = dateTime.toDateString().split(' ')//breaking up the datetime for output


                    // Create response
                    let output = `Op ${readableDate[2]} ${readableDate[1]} in ${cityData['standard']['city']} 
                    is het ${conditions['description']} met een tempratuur van
                    ${forecastTemp}°C en een windsnelheid van
                    ${forecastWind} knopen.`;

                    // Resolve the promise with the output text
                    console.log(output);
                    console.log('Im done grabbing weather data!')
                    resolve(output);

                    
                }
                else{//if no datetime was provided we respond with current weather
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
                };
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

