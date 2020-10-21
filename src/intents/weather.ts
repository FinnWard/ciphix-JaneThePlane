import {callGeoApi, callWeatherApi} from './../functions';

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
    if (conv.parameters['date']) {
        dateTime = new Date(conv.parameters['date']);
    }
    
    //getting further data on the city eg lattitude & longtitude
    console.log('Im amout to grab geo data!')
    return callGeoApi(city).then((cityOutput) => {
        let cityData = cityOutput;
        console.log('Im amout to grab weather data!')
        return callWeatherApi(cityData,dateTime).then((output) => {
            conv.add(output); // Return the results of the weather API to Dialogflow
        }).catch(() => conv.add(`Oei! Ik kan het weer niet vinden maar ik hoop dat het zonnig is!`));
    }).catch(() => conv.add(`Oei! Klinkt als een leuke plek maar ik herken het niet. Is dat een stad?`));
    
}